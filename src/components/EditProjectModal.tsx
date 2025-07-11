import React, { useState } from 'react';
import { Project } from '../types';
import { X, Save, Palette } from 'lucide-react';

interface EditProjectModalProps {
  project: Project;
  onSave: (projectId: string, updates: { name: string; color: string; parent_id?: string | null }) => void;
  onClose: () => void;
  projects: Project[];
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  onSave,
  onClose,
  projects
}) => {
  const [name, setName] = useState(project.name);
  const [selectedColor, setSelectedColor] = useState(project.color);
  const [parentId, setParentId] = useState(project.parent_id || '');

  const projectColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
  ];

  const availableParentProjects = projects.filter(p => 
    p.id !== project.id && 
    p.parent_id !== project.id // Prevent circular references
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Prevent renaming Inbox project
    const isInbox = project.name === 'Inbox' && !project.parent_id;
    if (isInbox && name.trim() !== 'Inbox') {
      return; // Don't allow renaming Inbox
    }

    onSave(project.id, {
      name: name.trim(),
      color: selectedColor,
      parent_id: parentId || null
    });

    onClose();
  };

  const isInbox = project.name === 'Inbox' && !project.parent_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isInbox && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> The Inbox project is a special default project and has limited editing options.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter project name..."
              disabled={isInbox}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <Palette size={16} className="inline mr-1" />
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {projectColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={isInbox}
                  className={`
                    w-8 h-8 rounded-full ${color} transition-all duration-200
                    ${selectedColor === color 
                      ? 'ring-2 ring-gray-400 ring-offset-2 scale-110' 
                      : 'hover:scale-105'
                    }
                    ${isInbox ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
              ))}
            </div>
          </div>

          {!isInbox && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Parent Project (Optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">No parent project</option>
                {availableParentProjects.map(parentProject => (
                  <option key={parentProject.id} value={parentProject.id}>
                    {parentProject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};