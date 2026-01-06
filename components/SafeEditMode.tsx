'use client'

import { useState } from 'react'

interface SafeEditModeProps {
  isEditMode: boolean
  onToggleEditMode: (enabled: boolean) => void
  stagedChanges: any[]
  onConfirmChanges: () => void
  onCancelChanges: () => void
}

export default function SafeEditMode({
  isEditMode,
  onToggleEditMode,
  stagedChanges,
  onConfirmChanges,
  onCancelChanges
}: SafeEditModeProps) {
  const [confirmText, setConfirmText] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleEnableEdit = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: You are about to edit a LIVE DATABASE!\n\n' +
      'Changes will affect production data.\n' +
      'Are you sure you want to continue?'
    )
    if (confirmed) {
      onToggleEditMode(true)
    }
  }

  const handleSaveChanges = () => {
    if (stagedChanges.length === 0) {
      alert('No changes to save')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmSave = () => {
    if (confirmText !== 'YES') {
      alert('You must type "YES" exactly to confirm changes')
      return
    }
    onConfirmChanges()
    setShowConfirmDialog(false)
    setConfirmText('')
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isEditMode ? (
            <button
              onClick={handleEnableEdit}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium"
            >
              🔓 Enable Edit Mode
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                ⚠️ EDITING LIVE DATABASE
              </div>
              <button
                onClick={() => onToggleEditMode(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Exit Edit Mode
              </button>
            </div>
          )}
        </div>

        {isEditMode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {stagedChanges.length} staged change{stagedChanges.length !== 1 ? 's' : ''}
            </span>
            {stagedChanges.length > 0 && (
              <>
                <button
                  onClick={onCancelChanges}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel Changes
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                >
                  💾 Save Changes
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              ⚠️ CONFIRM DATABASE CHANGES
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Changes to be applied:</h4>
              <div className="bg-gray-50 rounded p-3 max-h-60 overflow-y-auto">
                {stagedChanges.map((change, index) => (
                  <div key={index} className="mb-3 p-2 bg-white rounded border">
                    <div className="text-sm font-medium">
                      Table: {change.tableName}, Row: {change.rowId}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <strong>Before:</strong>
                          <pre className="text-xs bg-red-50 p-1 rounded mt-1">
                            {JSON.stringify(change.before, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <strong>After:</strong>
                          <pre className="text-xs bg-green-50 p-1 rounded mt-1">
                            {JSON.stringify(change.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Type "YES" to confirm these changes to the LIVE database:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Type YES here"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setConfirmText('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={confirmText !== 'YES'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}