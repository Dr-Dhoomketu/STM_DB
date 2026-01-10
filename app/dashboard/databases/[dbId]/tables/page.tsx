import { getCurrentUser } from '@/lib/get-current-user';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getExternalDbClient, closeExternalDbClient } from '@/lib/db';
import { TablesList } from '@/components/TablesList';
import { notFound } from 'next/navigation';

export default async function TablesPage({
  params,
}: {
  params: { dbId: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const pool = getPool();
  const dbId = params.dbId;

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

  // Connect to external database and get tables
  let client;
  let tables: any[] = [];

  try {
    client = await getExternalDbClient(
      dbConfig.host,
      dbConfig.port,
      dbConfig.database_name,
      dbConfig.username,
      password
    );

    // Get all tables
    const tablesResult = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Get row counts for each table
    const tablesWithCounts = await Promise.all(
      tablesResult.rows.map(async (table) => {
        try {
          const countResult = await client!.query(
            `SELECT COUNT(*) as count FROM "${table.table_name}"`
          );
          return {
            name: table.table_name,
            column_count: parseInt(table.column_count),
            row_count: parseInt(countResult.rows[0].count),
          };
        } catch (err) {
          // If we can't count (permissions issue), return 0
          return {
            name: table.table_name,
            column_count: parseInt(table.column_count),
            row_count: 0,
          };
        }
      })
    );

    tables = tablesWithCounts;
  } catch (error: any) {
    console.error('Error connecting to database:', error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  } finally {
    if (client) {
      await closeExternalDbClient(client);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{dbConfig.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {dbConfig.host}:{dbConfig.port} / {dbConfig.database_name}
        </p>
        {dbConfig.environment === 'prod' && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
            ⚠️ PRODUCTION DATABASE - Extra caution required
          </div>
        )}
      </div>

      <TablesList
        dbId={dbId}
        tables={tables}
        readOnly={dbConfig.read_only}
        editEnabled={dbConfig.edit_enabled}
        environment={dbConfig.environment}
      />
    </div>
  );
}
