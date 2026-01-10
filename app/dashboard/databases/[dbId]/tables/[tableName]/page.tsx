// app/dashboard/databases/[dbId]/tables/[tableName]/page.tsx

import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getExternalDbClient, closeExternalDbClient } from '@/lib/db';
import { TableDataViewer } from '@/components/TableDataViewer';
import { notFound } from 'next/navigation';
import { logAuditEvent, getClientIp } from '@/lib/audit';

export default async function TableDataPage({
  params,
  searchParams,
}: {
  params: { dbId: string; tableName: string };
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();
  if (!session) {
    notFound();
  }

  const pool = getPool();
  // FIXED: Use UUID string directly, don't parse as integer
  const dbId = params.dbId;
  const tableName = decodeURIComponent(params.tableName);
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // Get database config
  const dbResult = await pool.query(
    'SELECT * FROM databases WHERE id = $1',
    [dbId]
  );

  if (dbResult.rows.length === 0) {
    notFound();
  }

  const dbConfig = dbResult.rows[0];
  const password = decrypt(dbConfig.password_encrypted);

  // Note: View events are logged less frequently to avoid spam
  // Only significant actions (edits) are logged in detail

  // Connect to external database
  let client;
  let columns: any[] = [];
  let rows: any[] = [];
  let totalRows = 0;

  try {
    client = await getExternalDbClient(
      dbConfig.host,
      dbConfig.port,
      dbConfig.database_name,
      dbConfig.username,
      password
    );

    // Get column information
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    columns = columnsResult.rows;

    // Build WHERE clause for search
    let whereClause = '';
    const queryParams: any[] = [];
    if (search) {
      const searchConditions = columns.map((col, idx) => {
        queryParams.push(`%${search}%`);
        return `CAST("${col.column_name}" AS TEXT) ILIKE $${queryParams.length}`;
      });
      whereClause = `WHERE ${searchConditions.join(' OR ')}`;
    }

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) as count FROM "${tableName}" ${whereClause}`,
      queryParams
    );
    totalRows = parseInt(countResult.rows[0].count);

    // Get paginated data
    queryParams.push(pageSize, offset);
    const dataResult = await client.query(
      `SELECT * FROM "${tableName}" ${whereClause} ORDER BY 1 LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );

    rows = dataResult.rows;
  } catch (error: any) {
    console.error('Error fetching table data:', error);
    throw new Error(`Failed to fetch table data: ${error.message}`);
  } finally {
    if (client) {
      await closeExternalDbClient(client);
    }
  }

  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <TableDataViewer
      dbId={dbId}
      dbName={dbConfig.name}
      tableName={tableName}
      columns={columns}
      rows={rows}
      currentPage={page}
      totalPages={totalPages}
      totalRows={totalRows}
      search={search}
      readOnly={dbConfig.read_only}
      editEnabled={dbConfig.edit_enabled}
      extraConfirmationRequired={dbConfig.extra_confirmation_required}
      environment={dbConfig.environment}
    />
  );
}