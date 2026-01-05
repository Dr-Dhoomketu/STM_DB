import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { AuditLogsList } from '@/components/AuditLogsList';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; database?: string; action?: string };
}) {
  const session = await auth();
  const pool = getPool();

  const page = parseInt(searchParams.page || '1');
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  let query = `
    SELECT a.*, u.email as user_email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (searchParams.database) {
    query += ` AND a.database_name ILIKE $${paramIndex}`;
    params.push(`%${searchParams.database}%`);
    paramIndex++;
  }

  if (searchParams.action) {
    query += ` AND a.action = $${paramIndex}`;
    params.push(searchParams.action);
    paramIndex++;
  }

  query += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(pageSize, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
  const countParams: any[] = [];
  let countParamIndex = 1;

  if (searchParams.database) {
    countQuery += ` AND database_name ILIKE $${countParamIndex}`;
    countParams.push(`%${searchParams.database}%`);
    countParamIndex++;
  }

  if (searchParams.action) {
    countQuery += ` AND action = $${countParamIndex}`;
    countParams.push(searchParams.action);
    countParamIndex++;
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalRows = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Audit Logs</h1>
      <AuditLogsList
        logs={result.rows}
        currentPage={page}
        totalPages={totalPages}
        totalRows={totalRows}
        filters={{
          database: searchParams.database || '',
          action: searchParams.action || '',
        }}
      />
    </div>
  );
}

