'use client';

import { useState, useEffect } from 'react';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface EditRowDialogProps {
  dbId: number;
  dbName: string;
  tableName: string;
  columns: Column[];
  row: any;
  environment: string;
  extraConfirmationRequired: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditRowDialog({
  dbId,
  dbName,
  tableName,
  columns,
  row,
  environment,
  extraConfirmationRequired,
  onClose,
  onUpdated,
}: EditRowDialogProps) {
  const [formData, setFormData] = useState<any>({ ...row });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [diff, setDiff] = useState<{ before: any; after: any } | null>(null);

  // Get primary key column (assume first column or id column)
  const primaryKeyColumn =
    columns.find((col) => col.column_name.toLowerCase() === 'id') ||
    columns[0];

  const handleFieldChange = (columnName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handlePreview = () => {
    // Calculate diff
    const before: any = {};
    const after: any = {};

    columns.forEach((col) => {
      const oldValue = row[col.column_name];
      const newValue = formData[col.column_name];

      if (oldValue !== newValue) {
        before[col.column_name] = oldValue;
        after[col.column_name] = newValue;
      }
    });

    setDiff({ before, after });
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!diff) {
      setError('Please preview changes first');
      return;
    }

    // Check confirmation
    const requiredConfirmation =
      environment === 'prod' && extraConfirmationRequired
        ? 'YES UPDATE PROD'
        : 'YES';

    if (confirmation !== requiredConfirmation) {
      setError(
        `Please type "${requiredConfirmation}" exactly to confirm this change`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/databases/update-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbId,
          tableName,
          primaryKeyColumn: primaryKeyColumn.column_name,
          primaryKeyValue: row[primaryKeyColumn.column_name],
          before: diff.before,
          after: diff.after,
          confirmation,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update row');
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = columns.some(
    (col) => row[col.column_name] !== formData[col.column_name]
  );

  const requiredConfirmation =
    environment === 'prod' && extraConfirmationRequired
      ? 'YES UPDATE PROD'
      : 'YES';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          Edit Row: {tableName}
        </h2>

        {environment === 'prod' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            ⚠️ PRODUCTION DATABASE - This change will be permanent and logged
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!showPreview ? (
          <>
            <div className="space-y-4 mb-6">
              {columns.map((col) => {
                const isPrimaryKey = col.column_name === primaryKeyColumn.column_name;
                const value = formData[col.column_name];
                const originalValue = row[col.column_name];
                const hasChanged = value !== originalValue;

                return (
                  <div key={col.column_name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col.column_name}
                      {isPrimaryKey && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Primary Key - Read Only)
                        </span>
                      )}
                      <span className="ml-2 text-xs text-gray-400">
                        ({col.data_type})
                      </span>
                      {hasChanged && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Changed)
                        </span>
                      )}
                    </label>
                    {isPrimaryKey ? (
                      <input
                        type="text"
                        value={value !== null && value !== undefined ? String(value) : ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value !== null && value !== undefined ? String(value) : ''}
                        onChange={(e) => handleFieldChange(col.column_name, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          hasChanged ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                        }`}
                      />
                    )}
                    {hasChanged && (
                      <div className="mt-1 text-xs text-gray-500">
                        Original: {originalValue !== null && originalValue !== undefined ? String(originalValue) : 'NULL'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePreview}
                disabled={!hasChanges}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Change Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Table:</h4>
                  <p className="text-sm text-gray-900">{tableName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Row ID:</h4>
                  <p className="text-sm text-gray-900">
                    {row[primaryKeyColumn.column_name]}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Before:</h4>
                  <pre className="text-sm bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                    {JSON.stringify(diff?.before, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">After:</h4>
                  <pre className="text-sm bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                    {JSON.stringify(diff?.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>"{requiredConfirmation}"</strong> to confirm this change:
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={requiredConfirmation}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setConfirmation('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || confirmation !== requiredConfirmation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Confirm & Update'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

