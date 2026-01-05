'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuditLog {
  id: number;
  user_email: string;
  database_name: string;
  table_name: string;
  row_id: string | null;
  action: string;
  before_data: any;
  after_data: any;
  ip_address: string | null;
  timestamp: string;
}

export function AuditLogsList({
  logs,
  currentPage,
  totalPages,
  totalRows,
  filters,
}: {
  logs: AuditLog[];
  currentPage: number;
  totalPages: number;
  totalRows: number;
  filters: { database: string; action: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [databaseFilter, setDatabaseFilter] = useState(filters.database);
  const [actionFilter, setActionFilter] = useState(filters.action);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (databaseFilter) {
      params.set('database', databaseFilter);
    } else {
      params.delete('database');
    }
    
    if (actionFilter) {
      params.set('action', actionFilter);
    } else {
      params.delete('action');
    }
    
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      UPDATE: 'bg-yellow-100 text-yellow-800',
      INSERT: 'bg-green-100 text-green-800',
      DELETE: 'bg-red-100 text-red-800',
      VIEW: 'bg-blue-100 text-blue-800',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colors[action] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {action}
      </span>
    );
  };

  return (
    <div>
      <form onSubmit={handleFilter} className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database
            </label>
            <input
              type="text"
              value={databaseFilter}
              onChange={(e) => setDatabaseFilter(e.target.value)}
              placeholder="Filter by database..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Actions</option>
              <option value="VIEW">View</option>
              <option value="UPDATE">Update</option>
              <option value="INSERT">Insert</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Filter
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.database_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.table_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.row_id || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.action === 'UPDATE' && (
                      <details className="cursor-pointer">
                        <summary className="text-indigo-600 hover:text-indigo-900">
                          View Changes
                        </summary>
                        <div className="mt-2 space-y-2">
                          {log.before_data && (
                            <div>
                              <strong className="text-red-600">Before:</strong>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.before_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.after_data && (
                            <div>
                              <strong className="text-green-600">After:</strong>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.after_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                    {log.action === 'INSERT' && log.after_data && (
                      <details className="cursor-pointer">
                        <summary className="text-indigo-600 hover:text-indigo-900">
                          View Data
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.after_data, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.action === 'VIEW' && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No audit logs found
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * 50 + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 50, totalRows)}
                </span>{' '}
                of <span className="font-medium">{totalRows}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

