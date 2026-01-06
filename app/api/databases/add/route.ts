import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { Client } from 'pg';
import { z } from 'zod';

export const runtime = 'nodejs';

// Validation schema for PostgreSQL URL
const addDatabaseSchema = z.object({
  url: z.string().min(1, 'Database URL is required'),
  name: z.string().min(1, 'Database name is required'),
  environment: z.enum(['dev', 'staging', 'prod']),
  description: z.string().optional(),
  projectId: z.string().optional(),
});

// Parse PostgreSQL URL
function parsePostgresUrl(url: string) {
  try {
    if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
      throw new Error('Invalid protocol. Must start with postgres:// or postgresql://');
    }

    const parsed = new URL(url);

    if (!parsed.hostname || !parsed.username || !parsed.password) {
      throw new Error('URL must include hostname, username, and password');
    }

    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || 'postgres',
      username: parsed.username,
      password: parsed.password,
    };
  } catch (error) {
    throw new Error(
      `Invalid PostgreSQL URL: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// Test database connection
async function testDatabaseConnection(connectionParams: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}) {
  const client = new Client({
    host: connectionParams.host,
    port: connectionParams.port,
    database: connectionParams.database,
    user: connectionParams.username,
    password: connectionParams.password,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    throw new Error(
      `Database connection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  } finally {
    try {
      await client.end();
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = addDatabaseSchema.parse(body);

    const connectionParams = parsePostgresUrl(validatedData.url);
    await testDatabaseConnection(connectionParams);

    const existingDb = await prisma.database.findFirst({
      where: {
        host: connectionParams.host,
        port: connectionParams.port,
        databaseName: connectionParams.database,
        username: connectionParams.username,
      },
    });

    if (existingDb) {
      return NextResponse.json(
        { error: 'A database with the same connection parameters already exists' },
        { status: 409 }
      );
    }

    const encryptedPassword = encrypt(connectionParams.password);

    const newDatabase = await prisma.database.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        host: connectionParams.host,
        port: connectionParams.port,
        databaseName: connectionParams.database,
        username: connectionParams.username,
        passwordEncrypted: encryptedPassword,
        environment: validatedData.environment,
        projectId: validatedData.projectId,
        isActive: true,
        readOnly: true,
        editEnabled: false,
        extraConfirmationRequired: validatedData.environment === 'prod',
      },
    });

    return NextResponse.json({
      success: true,
      database: {
        id: newDatabase.id,
        name: newDatabase.name,
        description: newDatabase.description,
        host: newDatabase.host,
        port: newDatabase.port,
        databaseName: newDatabase.databaseName,
        username: newDatabase.username,
        environment: newDatabase.environment,
        isActive: newDatabase.isActive,
        createdAt: newDatabase.createdAt,
      },
    });
  } catch (error) {
    console.error('Error adding database:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add database' },
      { status: 500 }
    );
  }
}
