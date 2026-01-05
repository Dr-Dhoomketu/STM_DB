import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { encrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      website_url,
      description,
      project_id,
      host,
      port,
      database_name,
      username,
      password,
      environment,
      read_only,
      edit_enabled,
      extra_confirmation_required,
    } = body;

    // Validation
    if (!name || !host || !database_name || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['dev', 'staging', 'prod'].includes(environment)) {
      return NextResponse.json(
        { error: 'Invalid environment' },
        { status: 400 }
      );
    }

    // Encrypt password
    const encryptedPassword = encrypt(password);

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO databases 
       (name, website_url, description, project_id, host, port, database_name, username, password_encrypted, 
        environment, read_only, edit_enabled, extra_confirmation_required)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, name, website_url, description, host, port, database_name, environment`,
      [
        name.trim(),
        website_url?.trim() || null,
        description?.trim() || null,
        project_id || null,
        host.trim(),
        port,
        database_name.trim(),
        username.trim(),
        encryptedPassword,
        environment,
        read_only ?? true,
        edit_enabled ?? false,
        extra_confirmation_required ?? true,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating database:', error);
    return NextResponse.json(
      { error: 'Failed to register database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT d.id, d.name, d.website_url, d.description, d.host, d.port, d.database_name, d.environment, 
              d.read_only, d.edit_enabled, d.extra_confirmation_required,
              p.name as project_name
       FROM databases d
       LEFT JOIN projects p ON d.project_id = p.id
       ORDER BY d.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch databases' },
      { status: 500 }
    );
  }
}

