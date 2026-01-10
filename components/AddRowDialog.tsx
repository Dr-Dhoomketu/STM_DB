'use client';

import { useState } from 'react';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface AddRowDialogProps {
  dbId: string;
  dbName: string;
  tableName: string;
  columns: Column[];
  environment: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddRowDialog({
  dbId,
  dbName,
  tableName,
  columns,
  environment,
  onClose,
  onAdded,
}: AddRowDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFieldChange = (columnName: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [columnName]: value === '' ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/databases/add-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbId,
          tableName,
          data: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add row');
      }

      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Row: {tableName}</h2>

        {environment === 'prod' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            ⚠️ PRODUCTION DATABASE - New data will be added permanently
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {columns.map((col) => {
              const isAutoIncrement = col.column_name.toLowerCase() === 'id' && 
                                     (col.data_type.includes('serial') || col.data_type.includes('uuid'));
              
              return (
                <div key={col.column_name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col.column_name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({col.data_type})
                    </span>
                    {col.is_nullable === 'NO' && !isAutoIncrement && (
                      <span className="ml-2 text-xs text-red-600">*Required</span>
                    )}
                    {isAutoIncrement && (
                      <span className="ml-2 text-xs text-green-600">(Auto-generated)</span>
                    )}
                  </label>
                  {isAutoIncrement ? (
                    <input
                      type="text"
                      value="Auto-generated"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[col.column_name] || ''}
                      onChange={(e) => handleFieldChange(col.column_name, e.target.value)}
                      placeholder={col.is_nullable === 'YES' ? 'Leave empty for NULL' : 'Required'}
                      required={col.is_nullable === 'NO'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Row'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
