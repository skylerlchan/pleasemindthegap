import React, { useState } from 'react';
import { Project } from '../types';
import { X, Plus, Palette } from 'lucide-react';

interface AddSubProjectModalProps {
  parentProject: Project;
  onAddProject: (project: { name: string; color: string }) => void;
  onClose: () => void;
}

export const AddSubProjectModal: React.FC<AddSubProjectModalProps> = ({
  parentProject,
  onAddProject,
  onClose
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');

  const projectColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProject({
      name: name.trim(),
      color: selectedColor
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Sub-Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">Parent Project:</span> {parentProject.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Sub-Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter sub-project name..."
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
                  className={`
                    w-8 h-8 rounded-full ${color} transition-all duration-200
                    ${selectedColor === color 
                      ? 'ring-2 ring-gray-400 ring-offset-2 scale-110' 
                      : 'hover:scale-105'
                    }
                  `}
                />
              ))}
            </div>
          </div>

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
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Add Sub-Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};