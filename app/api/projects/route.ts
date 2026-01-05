import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const result = await pool.query(
      'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name.trim(), description?.trim() || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
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
      'SELECT id, name, description, created_at FROM projects ORDER BY created_at DESC'
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

