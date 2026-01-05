import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getExternalDbClient, closeExternalDbClient } from '@/lib/db';
import { logAuditEvent, getClientIp } from '@/lib/audit';

export async function POST(request: NextRequest) {
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

    // Verify confirmation
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

    try {
      // Build UPDATE query
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

      // Execute update
      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Row not found or update failed');
      }

      const updatedRow = result.rows[0];

      // Log audit event
      const ipAddress = getClientIp(request);
      await logAuditEvent({
        userId: parseInt(session.user.id),
        userEmail: session.user.email,
        databaseId: dbId,
        databaseName: dbConfig.name,
        tableName: tableName,
        rowId: String(primaryKeyValue),
        action: 'UPDATE',
        beforeData: before,
        afterData: after,
        ipAddress: ipAddress,
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

