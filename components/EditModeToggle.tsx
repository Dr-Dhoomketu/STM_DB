'use client';

export function EditModeToggle({
  editMode,
  onToggle,
  expiresAt,
}: {
  editMode: boolean;
  onToggle: (enabled: boolean) => void;
  expiresAt: Date | null;
}) {
  const handleToggle = () => {
    if (!editMode) {
      const confirmed = window.confirm(
        '⚠️ WARNING: Enabling edit mode will allow you to modify database records.\n\n' +
          'All changes will be logged and require confirmation.\n\n' +
          'Edit mode will automatically expire after 30 minutes.\n\n' +
          'Do you want to continue?'
      );
      if (confirmed) {
        onToggle(true);
      }
    } else {
      onToggle(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {expiresAt && (
        <div className="text-sm text-gray-600">
          Expires: {expiresAt.toLocaleTimeString()}
        </div>
      )}
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={editMode}
          onChange={handleToggle}
          className="sr-only"
        />
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            editMode ? 'bg-yellow-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              editMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          Edit Mode {editMode ? '(ON)' : '(OFF)'}
        </span>
      </label>
    </div>
  );
}

