import { getCurrentUser } from '@/lib/get-current-user';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getExternalDbClient, closeExternalDbClient } from '@/lib/db';
import { TablesList } from '@/components/TablesList';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Table {
  name: string;
  column_count: number;
  row_count: number;
}

export default async function DatabaseDetailPage({
  params,
}: {
  params: { dbId: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const pool = getPool();
  const dbId = parseInt(params.dbId);

  // Get database config
  const dbResult = await pool.query(
    'SELECT * FROM databases WHERE id = $1 AND is_active = true',
    [dbId]
  );

  if (dbResult.rows.length === 0) {
    notFound();
  }

  const dbConfig = dbResult.rows[0];
  const password = decrypt(dbConfig.password_encrypted);

  // Connect to external database and get tables
  let client;
  let tables: Table[] = [];

  try {
    client = await getExternalDbClient(
      dbConfig.host,
      dbConfig.port,
      dbConfig.database_name,
      dbConfig.username,
      password
    );

    // Get list of tables with their info
    const tablesResult = await client.query(`
      SELECT 
        t.table_name as name,
        COUNT(c.column_name) as column_count,
        COALESCE(s.n_live_tup, 0) as row_count
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      LEFT JOIN pg_stat_user_tables s 
        ON t.table_name = s.relname
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name, s.n_live_tup
      ORDER BY t.table_name
    `);

    tables = tablesResult.rows.map(row => ({
      name: row.name,
      column_count: parseInt(row.column_count) || 0,
      row_count: parseInt(row.row_count) || 0,
    }));
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    throw new Error(`Failed to fetch tables: ${error.message}`);
  } finally {
    if (client) {
      await closeExternalDbClient(client);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/databases"
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
        >
          ← Back to Databases
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dbConfig.name}</h1>
            {dbConfig.description && (
              <p className="text-gray-600 mt-1">{dbConfig.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>{dbConfig.host}:{dbConfig.port}</span>
              <span>•</span>
              <span>{dbConfig.database_name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                dbConfig.environment === 'prod'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {dbConfig.environment.toUpperCase()}
            </span>
            {dbConfig.read_only && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                READ-ONLY
              </span>
            )}
          </div>
        </div>
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