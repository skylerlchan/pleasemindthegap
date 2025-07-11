import React from 'react';
import { Task, Project } from '../types';
import { formatTime, isPast, isToday } from '../utils';
import { Check, Trash2, Edit3 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  project: Project;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  compact?: boolean;
  draggable?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  project, 
  onToggle, 
  onDelete, 
  onEdit,
  compact = false,
  draggable = false
}) => {
  const deadline = new Date(task.deadline);
  const isHolding = deadline.getHours() === 23 && deadline.getMinutes() === 59;
  const isOverdue = isPast(deadline) && !task.completed;
  const isDueToday = isToday(deadline);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task.id,
      originalDeadline: task.deadline
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback during drag
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
    
    // Reset opacity after drag ends
    setTimeout(() => {
      target.style.opacity = '1';
    }, 100);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };
  
  if (compact) {
    return (
      <div className={`
        group relative p-2 rounded-lg border transition-all duration-200 hover:shadow-sm
        w-full h-full min-w-0 overflow-hidden flex flex-col
        ${draggable ? 'cursor-move' : ''}
        ${task.completed 
          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-75' 
          : isOverdue 
            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700' 
            : `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500`
        }
      `}
      draggable={draggable && !task.completed}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      >
        <div className="flex items-start justify-between h-full min-h-[44px]">
          <div className="flex items-start space-x-1 flex-1 min-w-0">
            <div className={`w-1.5 h-1.5 rounded-full ${project.color} flex-shrink-0 mt-1`} />
            <button
              onClick={() => onToggle(task.id)}
              className={`
                w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5
                transition-all duration-200 hover:scale-110
                ${task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {task.completed && <Check size={8} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`
                text-base font-semibold leading-tight break-words hyphens-auto
                ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}
              `}>
                {task.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-start ml-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            {onEdit && (
              <button
                onClick={() => onEdit(task.id)}
                className="text-blue-500 hover:text-blue-700 transition-colors p-0.5 rounded flex-shrink-0 touch-manipulation"
              >
                <Edit3 size={12} />
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-700 transition-colors p-0.5 rounded flex-shrink-0 touch-manipulation"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`
      group relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md
      ${draggable ? 'cursor-move' : ''}
      ${task.completed 
        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-75' 
        : isOverdue 
          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700' 
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
      }
    `}
    draggable={draggable && !task.completed}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
    >
      <div className="flex items-center pr-16">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(task.id)}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-110
              ${task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {task.completed && <Check size={14} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${project.color}`}
                title={project.name}
              />
              <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                {project.name}
              </span>
            </div>
            <p className={`
              font-semibold text-lg text-gray-900 dark:text-gray-100 break-words hyphens-auto mt-1 pr-2
              ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}
            `}>
              {task.title}
            </p>
          </div>
        </div>
        
        {/* Fixed position time badge */}
        <div className={`
          absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
          ${isDueToday 
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
            : isOverdue 
              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' 
              : isHolding
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }
        `}>
          {isHolding ? 'Holding' : formatTime(deadline)}
        </div>
        
        {/* Action buttons - positioned below time badge */}
        <div className="absolute top-8 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task.id)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-1 py-1 rounded"
            >
              <Edit3 size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors px-1 py-1 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};