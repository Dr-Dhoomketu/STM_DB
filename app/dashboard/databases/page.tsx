import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { DatabasesList } from '@/components/DatabasesList';
import { CreateDatabaseForm } from '@/components/CreateDatabaseForm';
import { AddDatabaseForm } from '@/components/AddDatabaseForm';

export default async function DatabasesPage() {
  const session = await auth();
  const pool = getPool();

  const result = await pool.query(
    `SELECT d.id, d.name, d.website_url, d.description, d.host, d.port, d.database_name, d.environment, 
            d.read_only, d.edit_enabled, d.extra_confirmation_required, d.is_active,
            p.name as project_name
     FROM databases d
     LEFT JOIN projects p ON d.project_id = p.id
     WHERE d.is_active = true
     ORDER BY d.created_at DESC`
  );

  const projectsResult = await pool.query(
    'SELECT id, name FROM projects ORDER BY name'
  );

  const databases = result.rows;
  const projects = projectsResult.rows;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Databases</h1>
        {session?.user?.role === 'ADMIN' && (
          <div className="flex space-x-3">
            <AddDatabaseForm projects={projects} />
            <CreateDatabaseForm projects={projects} />
          </div>
        )}
      </div>

      <DatabasesList databases={databases} />
    </div>
  );
}

