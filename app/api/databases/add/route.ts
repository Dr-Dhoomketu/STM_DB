import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { Client } from 'pg';
import { z } from 'zod';

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
    // Validate protocol
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
      database: parsed.pathname.slice(1) || 'postgres', // Remove leading slash
      username: parsed.username,
      password: parsed.password,
    };
  } catch (error) {
    throw new Error(`Invalid PostgreSQL URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    connectionTimeoutMillis: 5000, // 5 second timeout
  });

  try {
    await client.connect();
    // Test with a simple query
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ADMIN-ONLY endpoint
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addDatabaseSchema.parse(body);

    // Parse PostgreSQL URL
    const connectionParams = parsePostgresUrl(validatedData.url);

    // Test database connection before storing
    await testDatabaseConnection(connectionParams);

    // Check if database with same connection already exists
    const existingDb = await prisma.database.findFirst({
      where: {
        host: connectionParams.host,
        port: connectionParams.port,
        databaseName: connectionParams.database,
        username: connectionParams.username,
      },
    });

    if (existingDb) {
      return NextResponse.json({
        error: 'A database with the same connection parameters already exists'
      }, { status: 409 });
    }

    // Encrypt password using AES-256-GCM
    const encryptedPassword = encrypt(connectionParams.password);

    // Store in control database
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
        // Security defaults
        readOnly: true,
        editEnabled: false,
        extraConfirmationRequired: validatedData.environment === 'prod',
      },
    });

    // Return success response WITHOUT credentials
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
        // NEVER return encrypted password or original URL
      },
    });

  } catch (error) {
    console.error('Error adding database:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to add database'
    }, { status: 500 });
  }
}