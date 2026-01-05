'use client';

import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export function ProjectsList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No projects yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="block hover:bg-gray-50 px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

