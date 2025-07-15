import React, { useState } from 'react';
import { Project } from '../types';
import { getTimeSlots, convertTimeSlotTo24Hour } from '../utils';
import { X, Plus, Zap, Calendar, Clock, FolderOpen } from 'lucide-react';

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
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('Holding');
  const [projectId, setProjectId] = useState(() => {
    // Default to Inbox project if it exists, otherwise first project
    const inboxProject = projects.find(p => p.name === 'Inbox' && !p.parent_id);
    return inboxProject?.id || projects[0]?.id || '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !timeSlot) return;

    // Use selected project or fallback to Inbox
    const finalProjectId = projectId || projects.find(p => p.name === 'Inbox' && !p.parent_id)?.id || projects[0]?.id;
    
    if (!finalProjectId) {
      console.error('No project available for task');
      return;
    }

    let deadline: Date;
    if (timeSlot === 'Holding') {
      // Set to 11:59 PM for holding tasks
      deadline = new Date(`${date}T23:59`);
    } else {
      const time24 = convertTimeSlotTo24Hour(timeSlot);
      deadline = new Date(`${date}T${time24}`);
    }
    
    onAddTask({
      title: title.trim(),
      deadline: deadline.toISOString(),
      project_id: finalProjectId
    });

    onClose();
  };

  const timeSlots = ['Holding', ...getTimeSlots()];

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FolderOpen size={16} className="inline mr-1" />
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Clock size={16} className="inline mr-1" />
                Time
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
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
              disabled={!title.trim() || !date || !timeSlot || !projectId}
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