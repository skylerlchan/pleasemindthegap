import React from 'react';
import { Task, Project } from '../types';
import { TaskItem } from './TaskItem';
import { formatTime } from '../utils';
import { X, Calendar, Clock } from 'lucide-react';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  date: Date;
  hour: number;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
}

export const EventListModal: React.FC<EventListModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  date,
  hour,
  onToggleTask,
  onDeleteTask,
  onEditTask
}) => {
  if (!isOpen) return null;

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  const isHoldingSlot = hour === -1;
  const timeDisplay = isHoldingSlot ? 'Holding' : formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isHoldingSlot ? 'Holding Tasks' : 'Scheduled Tasks'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-200 mt-1">
              <Calendar size={14} />
              <span>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              {!isHoldingSlot && (
                <>
                  <Clock size={14} />
                  <span>{timeDisplay}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                {isHoldingSlot ? <Clock size={32} className="mx-auto" /> : <Calendar size={32} className="mx-auto" />}
              </div>
              <p className="text-gray-500 dark:text-gray-300">No tasks scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => {
                const project = getProjectById(task.project_id);
                if (!project) return null;
                
                return (
                  <div key={task.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                    <TaskItem
                      task={task}
                      project={project}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onEdit={onEditTask}
                      compact={false}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};