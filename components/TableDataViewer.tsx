'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditModeToggle } from './EditModeToggle';
import { EditRowDialog } from './EditRowDialog';
import { AddRowDialog } from './AddRowDialog';
import { AddColumnDialog } from './AddColumnDialog';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface TableDataViewerProps {
  dbId: string;
  dbName: string;
  tableName: string;
  columns: Column[];
  rows: any[];
  currentPage: number;
  totalPages: number;
  totalRows: number;
  search: string;
  readOnly: boolean;
  editEnabled: boolean;
  extraConfirmationRequired: boolean;
  environment: string;
}

export function TableDataViewer({
  dbId,
  dbName,
  tableName,
  columns,
  rows,
  currentPage,
  totalPages,
  totalRows,
  search: initialSearch,
  readOnly,
  editEnabled,
  extraConfirmationRequired,
  environment,
}: TableDataViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [editMode, setEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editModeExpiresAt, setEditModeExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    if (editMode && !editModeExpiresAt) {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      setEditModeExpiresAt(expiresAt);
    }

    if (editMode && editModeExpiresAt) {
      const timer = setInterval(() => {
        if (new Date() > editModeExpiresAt) {
          setEditMode(false);
          setEditModeExpiresAt(null);
          alert('Edit mode has expired for security. Please re-enable if needed.');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [editMode, editModeExpiresAt]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleEditRow = (row: any) => {
    if (!editMode) {
      alert('Please enable edit mode first');
      return;
    }
    setEditingRow(row);
  };

  const handleDataUpdated = () => {
    setEditingRow(null);
    setShowAddRow(false);
    setShowAddColumn(false);
    router.refresh();
  };

  const canEdit = editEnabled && !readOnly && editMode;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tableName}</h1>
            <p className="text-sm text-gray-500 mt-1">{dbName}</p>
          </div>
          <div className="flex items-center space-x-4">
            {editEnabled && !readOnly && (
              <>
                {editMode && (
                  <>
                    <button
                      onClick={() => setShowAddRow(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      + Add Row
                    </button>
                    <button
                      onClick={() => setShowAddColumn(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      + Add Column
                    </button>
                  </>
                )}
                <EditModeToggle
                  editMode={editMode}
                  onToggle={setEditMode}
                  expiresAt={editModeExpiresAt}
                />
              </>
            )}
          </div>
        </div>

        {environment === 'prod' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            ⚠️ PRODUCTION DATABASE - All changes are logged and permanent
          </div>
        )}

        {editMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            ⚠️ EDIT MODE ENABLED - You can now add/edit data
            {editModeExpiresAt && (
              <span className="ml-2">
                (Expires: {editModeExpiresAt.toLocaleTimeString()})
              </span>
            )}
          </div>
        )}

        {readOnly && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            ✓ Read-only mode - No changes allowed
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all columns..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search');
                  params.set('page', '1');
                  router.push(`?${params.toString()}`);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.column_name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.column_name}
                    <span className="ml-2 text-gray-400 font-normal">
                      ({col.data_type})
                    </span>
                  </th>
                ))}
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col.column_name}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {row[col.column_name] !== null &&
                      row[col.column_name] !== undefined
                        ? String(row[col.column_name])
                        : (
                            <span className="text-gray-400 italic">NULL</span>
                          )}
                    </td>
                  ))}
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditRow(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No rows found
          </div>
        )}

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

      {editingRow && (
        <EditRowDialog
          dbId={dbId}
          dbName={dbName}
          tableName={tableName}
          columns={columns}
          row={editingRow}
          environment={environment}
          extraConfirmationRequired={extraConfirmationRequired}
          onClose={() => setEditingRow(null)}
          onUpdated={handleDataUpdated}
        />
      )}

      {showAddRow && (
        <AddRowDialog
          dbId={dbId}
          dbName={dbName}
          tableName={tableName}
          columns={columns}
          environment={environment}
          onClose={() => setShowAddRow(false)}
          onAdded={handleDataUpdated}
        />
      )}

      {showAddColumn && (
        <AddColumnDialog
          dbId={dbId}
          tableName={tableName}
          environment={environment}
          onClose={() => setShowAddColumn(false)}
          onAdded={handleDataUpdated}
        />
      )}
    </div>
  );
}
