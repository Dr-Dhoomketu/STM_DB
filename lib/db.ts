import { Pool, PoolClient } from 'pg';

// Internal dashboard database connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// External database connection (per request, not pooled)
export async function getExternalDbClient(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string
): Promise<PoolClient> {
  const pool = new Pool({
    host,
    port,
    database,
    user: username,
    password,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
  
  return await pool.connect();
}

// Safely close external database connection
export async function closeExternalDbClient(client: PoolClient): Promise<void> {
  try {
    client.release();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

