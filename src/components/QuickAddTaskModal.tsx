import React, { useState } from 'react';
import { Project } from '../types';
import { X, Plus, Zap } from 'lucide-react';

interface QuickAddTaskModalProps {
  projects: Project[];
  onAddTask: (task: { title: string; deadline: string; project_id: string }) => void;
  onClose: () => void;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  projects,
  onAddTask,
  onClose
}) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Find Inbox project or use first project as fallback
    const inboxProject = projects.find(p => p.name === 'Inbox' && !p.parent_id);
    const projectId = inboxProject?.id || projects[0]?.id;
    
    if (!projectId) {
      console.error('No project available for task');
      return;
    }

    // Set deadline to today at 11:59 PM (Holding)
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    
    onAddTask({
      title: title.trim(),
      deadline: today.toISOString(),
      project_id: projectId
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Zap size={20} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quick Add Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">Auto-settings:</span> Inbox • Today • Holding
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              What needs to be done?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter task title..."
              autoFocus
            />
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
              disabled={!title.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};