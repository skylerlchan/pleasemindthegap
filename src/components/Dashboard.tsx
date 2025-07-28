import React from 'react';
import { Task, Project } from '../types';
import { TaskItem } from './TaskItem';
import { formatDate, isToday, isPast, getProjectStatus } from '../utils';
import { CheckSquare, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  projects,
  onToggleTask,
  onDeleteTask,
  onEditTask
}) => {
  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  const todayTasks = tasks.filter(task => isToday(new Date(task.deadline)));
  const upcomingTasks = tasks.filter(task => {
    const deadline = new Date(task.deadline);
    return deadline > new Date() && !task.completed;
  });

  const overdueTasks = tasks.filter(task => 
    isPast(new Date(task.deadline)) && !task.completed
  );

  const completedTasks = tasks.filter(task => task.completed);

  const stats = [
    {
      title: 'Completed Tasks',
      value: completedTasks.length,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Due Today',
      value: todayTasks.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Upcoming Tasks',
      value: upcomingTasks.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Stats Cards */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-30`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>Overdue Tasks ({overdueTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {overdueTasks.map(task => {
              const project = getProjectById(task.project_id);
              if (!project) return null;
              
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Due Today ({todayTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {todayTasks.map(task => {
              const project = getProjectById(task.project_id);
              if (!project) return null;
              
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <Clock size={20} />
            <span>Upcoming Tasks ({upcomingTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {upcomingTasks.filter(task => !isToday(new Date(task.deadline))).slice(0, 10).map(task => {
              const project = getProjectById(task.project_id);
              if (!project) return null;
              
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              );
            })}
            {upcomingTasks.filter(task => !isToday(new Date(task.deadline))).length > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-300 text-center pt-2">
                And {upcomingTasks.filter(task => !isToday(new Date(task.deadline))).length - 10} more upcoming tasks...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center space-x-2">
            <CheckSquare size={20} />
            <span>Completed Tasks ({completedTasks.length})</span>
          </h3>
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map(task => {
              const project = getProjectById(task.project_id);
              if (!project) return null;
              
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              );
            })}
            {completedTasks.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-300 text-center pt-2">
                And {completedTasks.length - 5} more completed tasks...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks yet</h3>
          <p className="text-gray-600 dark:text-gray-200">Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
};