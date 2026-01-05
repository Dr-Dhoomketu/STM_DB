'use client';

import Link from 'next/link';

interface Database {
  id: number;
  name: string;
  website_url: string | null;
  description: string | null;
  host: string;
  port: number;
  database_name: string;
  environment: string;
  read_only: boolean;
  edit_enabled: boolean;
  extra_confirmation_required: boolean;
  project_name: string | null;
}

export function DatabasesList({ databases }: { databases: Database[] }) {
  if (databases.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">
          No databases registered yet. Add one to get started.
        </p>
      </div>
    );
  }

  const getEnvironmentBadge = (env: string) => {
    const colors = {
      prod: 'bg-red-100 text-red-800',
      staging: 'bg-yellow-100 text-yellow-800',
      dev: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colors[env as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {env.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Database & Website
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Connection
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Environment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {databases.map((db) => (
            <tr key={db.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {db.name}
                </div>
                {db.website_url && (
                  <div className="text-sm text-blue-600 hover:text-blue-800">
                    <a href={db.website_url} target="_blank" rel="noopener noreferrer">
                      {db.website_url}
                    </a>
                  </div>
                )}
                {db.description && (
                  <div className="text-sm text-gray-500">{db.description}</div>
                )}
                {db.project_name && (
                  <div className="text-xs text-gray-400">Project: {db.project_name}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {db.host}:{db.port}
                </div>
                <div className="text-sm text-gray-500">{db.database_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getEnvironmentBadge(db.environment)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  {db.read_only ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Read-Only
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Editable
                    </span>
                  )}
                  {db.extra_confirmation_required && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Extra Confirmation
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/dashboard/databases/${db.id}/tables`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Tables
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

