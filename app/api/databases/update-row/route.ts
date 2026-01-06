import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getExternalDbClient, closeExternalDbClient } from '@/lib/db';
import { logAuditEvent, getClientIp } from '@/lib/audit';
import { requireOTPVerification } from '@/lib/session-utils';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'


export async function POST(request: NextRequest) {
  // CRITICAL FIX 1: Enforce OTP verification for all DB writes
  const otpCheck = requireOTPVerification(request);
  if (!otpCheck.verified) {
    return NextResponse.json({ 
      error: otpCheck.error || 'OTP verification required to modify database' 
    }, { status: 401 });
  }

  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      dbId,
      tableName,
      primaryKeyColumn,
      primaryKeyValue,
      before,
      after,
      confirmation,
    } = body;

    // CRITICAL FIX 2: Enforce backend YES confirmation
    if (confirmation !== "YES") {
      return NextResponse.json({
        error: "Explicit confirmation required. Type YES to proceed."
      }, { status: 400 });
    }

    // Validation
    if (!dbId || !tableName || !primaryKeyColumn || !primaryKeyValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!before || !after || Object.keys(after).length === 0) {
      return NextResponse.json(
        { error: 'No changes to apply' },
        { status: 400 }
      );
    }

    // Get database config
    const pool = getPool();
    const dbResult = await pool.query(
      'SELECT * FROM databases WHERE id = $1',
      [dbId]
    );

    if (dbResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    const dbConfig = dbResult.rows[0];

    // Check permissions
    if (dbConfig.read_only) {
      return NextResponse.json(
        { error: 'Database is read-only' },
        { status: 403 }
      );
    }

    if (!dbConfig.edit_enabled) {
      return NextResponse.json(
        { error: 'Editing is not enabled for this database' },
        { status: 403 }
      );
    }

    // Additional confirmation for production (keeping existing logic)
    const requiredConfirmation =
      dbConfig.environment === 'prod' && dbConfig.extra_confirmation_required
        ? 'YES UPDATE PROD'
        : 'YES';

    if (confirmation !== requiredConfirmation) {
      return NextResponse.json(
        {
          error: `Invalid confirmation. Please type "${requiredConfirmation}" exactly.`,
        },
        { status: 400 }
      );
    }

    // Decrypt password and connect
    const password = decrypt(dbConfig.password_encrypted);
    const client = await getExternalDbClient(
      dbConfig.host,
      dbConfig.port,
      dbConfig.database_name,
      dbConfig.username,
      password
    );

    let updatedRow;
    try {
      // CRITICAL FIX 3: Guarantee audit log with DB write in transaction
      await prisma.$transaction(async (tx) => {
        // First, execute the database update on external database
        const setClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.keys(after).forEach((column) => {
          setClauses.push(`"${column}" = $${paramIndex}`);
          values.push(after[column]);
          paramIndex++;
        });

        values.push(primaryKeyValue);
        const whereClause = `"${primaryKeyColumn}" = $${paramIndex}`;
        const updateQuery = `UPDATE "${tableName}" SET ${setClauses.join(', ')} WHERE ${whereClause} RETURNING *`;

        const result = await client.query(updateQuery, values);
        if (result.rows.length === 0) {
          throw new Error('Row not found or update failed');
        }
        updatedRow = result.rows[0];

        // Then, create audit log in the same transaction
        // If this fails, the entire transaction (including the DB update) will be rolled back
        const ipAddress = getClientIp(request);
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            userEmail: session.user.email,
            databaseId: dbId,
            databaseName: dbConfig.name,
            tableName: tableName,
            rowId: String(primaryKeyValue),
            action: 'UPDATE',
            beforeData: before,
            afterData: after,
            ipAddress: ipAddress,
          }
        });
      });

      return NextResponse.json({
        success: true,
        row: updatedRow,
      });
    } finally {
      await closeExternalDbClient(client);
    }
  } catch (error: any) {
    console.error('Error updating row:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update row' },
      { status: 500 }
    );
  }
}