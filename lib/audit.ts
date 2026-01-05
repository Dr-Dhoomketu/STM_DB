import { getPool } from './db';

export interface AuditLogEntry {
  userId: number;
  userEmail: string;
  databaseId: number | null;
  databaseName: string;
  tableName: string;
  rowId: string | null;
  action: 'UPDATE' | 'INSERT' | 'DELETE' | 'VIEW';
  beforeData: any;
  afterData: any;
  ipAddress: string | null;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const pool = getPool();
  
  await pool.query(
    `INSERT INTO audit_logs 
     (user_id, user_email, database_id, database_name, table_name, row_id, action, before_data, after_data, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      entry.userId,
      entry.userEmail,
      entry.databaseId,
      entry.databaseName,
      entry.tableName,
      entry.rowId,
      entry.action,
      JSON.stringify(entry.beforeData),
      JSON.stringify(entry.afterData),
      entry.ipAddress,
    ]
  );
}

export function getClientIp(request: Request | Headers): string | null {
  const headers = request instanceof Request ? request.headers : request;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  return realIp || null;
}

