import React, { useState } from 'react';
import { Project } from '../types';
import { formatTime } from '../utils';
import { X, Plus } from 'lucide-react';

interface QuickTaskFormProps {
  date: Date;
  hour: number;
  projects: Project[];
  onSubmit: (task: { title: string; project_id: string }) => void;
  onCancel: () => void;
}

export const QuickTaskForm: React.FC<QuickTaskFormProps> = ({
  date,
  hour,
  projects,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(() => {
    // Default to Inbox project if it exists, otherwise first project
    const inboxProject = projects.find(p => p.name === 'Inbox' && !p.parent_id);
    return inboxProject?.id || projects[0]?.id || '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Use Inbox project if no project is selected
    const finalProjectId = projectId || projects.find(p => p.name === 'Inbox' && !p.parent_id)?.id || projects[0]?.id;
    if (!finalProjectId) return;

    onSubmit({
      title: title.trim(),
      project_id: finalProjectId
    });
  };

  let deadline: Date;
  let timeDisplay: string;
  
  if (hour === -1) {
    // Holding slot
    deadline = new Date(date);
    deadline.setHours(23, 59, 0, 0);
    timeDisplay = 'Holding';
  } else {
    deadline = new Date(date);
    deadline.setHours(hour, 0, 0, 0);
    timeDisplay = formatTime(deadline);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Add Task</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            {hour !== -1 && ' at '}
            <span className="font-medium">
              {timeDisplay}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Inbox (Default)</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};