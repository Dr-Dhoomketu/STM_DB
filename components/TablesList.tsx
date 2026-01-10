'use client';

import Link from 'next/link';

interface Table {
  name: string;
  column_count: number;
  row_count: number;
}

export function TablesList({
  dbId,
  tables,
  readOnly,
  editEnabled,
  environment,
}: {
  dbId: string; // FIXED: Changed from number to string to handle UUIDs
  tables: Table[];
  readOnly: boolean;
  editEnabled: boolean;
  environment: string;
}) {
  if (tables.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No tables found in this database.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Tables</h2>
          <div className="flex space-x-2">
            {readOnly && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Read-Only
              </span>
            )}
            {editEnabled && !readOnly && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Edit Enabled
              </span>
            )}
            {environment === 'prod' && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                PRODUCTION
              </span>
            )}
          </div>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {tables.map((table) => (
          <li key={table.name}>
            <Link
              href={`/dashboard/databases/${dbId}/tables/${table.name}`}
              className="block hover:bg-gray-50 px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {table.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {table.column_count} columns • {table.row_count.toLocaleString()} rows
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}