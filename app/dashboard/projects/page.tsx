import { auth } from '@/lib/auth-config';
import { getPool } from '@/lib/db';
import { ProjectsList } from '@/components/ProjectsList';
import { CreateProjectForm } from '@/components/CreateProjectForm';

export default async function ProjectsPage() {
  const session = await auth();
  const pool = getPool();

  const result = await pool.query(
    'SELECT id, name, description, created_at FROM projects ORDER BY created_at DESC'
  );

  const projects = result.rows;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {session?.user?.role === 'ADMIN' && <CreateProjectForm />}
      </div>

      <ProjectsList projects={projects} />
    </div>
  );
}

