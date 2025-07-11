import React, { useMemo } from 'react';
import { Task, Project } from '../types';
import { isPast, isToday } from '../utils';
import { Trophy, Target, Clock, CheckCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface LifetimeTrackerProps {
  tasks: Task[];
  projects: Project[];
}

export const LifetimeTracker: React.FC<LifetimeTrackerProps> = ({ tasks, projects }) => {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const overdueTasks = tasks.filter(task => !task.completed && isPast(new Date(task.deadline))).length;
    const todayTasks = tasks.filter(task => isToday(new Date(task.deadline))).length;
    const upcomingTasks = tasks.filter(task => !task.completed && new Date(task.deadline) > new Date()).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Project stats
    const totalProjects = projects.length;
    const finishedProjects = projects.filter(project => project.status === 'finished').length;
    
    // Productivity metrics
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekCompleted = tasks.filter(task => 
      task.completed && new Date(task.created_at) >= thisWeekStart
    ).length;
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekCompleted = tasks.filter(task => 
      task.completed && 
      new Date(task.created_at) >= lastWeekStart && 
      new Date(task.created_at) < thisWeekStart
    ).length;
    
    const weeklyTrend = lastWeekCompleted > 0 
      ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
      : thisWeekCompleted > 0 ? 100 : 0;
    
    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      todayTasks,
      upcomingTasks,
      completionRate,
      totalProjects,
      finishedProjects,
      thisWeekCompleted,
      weeklyTrend
    };
  }, [tasks, projects]);

  const statCards = [
    {
      title: 'Total Completion',
      value: `${stats.completionRate}%`,
      subtitle: `${stats.completedTasks} of ${stats.totalTasks} tasks`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
      trend: stats.completionRate >= 80 ? 'excellent' : stats.completionRate >= 60 ? 'good' : 'needs-improvement'
    },
    {
      title: 'This Week',
      value: stats.thisWeekCompleted.toString(),
      subtitle: `${stats.weeklyTrend >= 0 ? '+' : ''}${stats.weeklyTrend}% vs last week`,
      icon: TrendingUp,
      color: stats.weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.weeklyTrend >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50',
      trend: stats.weeklyTrend >= 20 ? 'excellent' : stats.weeklyTrend >= 0 ? 'good' : 'declining'
    },
    {
      title: 'Due Today',
      value: stats.todayTasks.toString(),
      subtitle: 'tasks scheduled',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      trend: stats.todayTasks <= 5 ? 'manageable' : 'busy'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks.toString(),
      subtitle: 'need attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/50',
      trend: stats.overdueTasks === 0 ? 'excellent' : stats.overdueTasks <= 3 ? 'manageable' : 'critical'
    },
    {
      title: 'Projects',
      value: `${stats.finishedProjects}/${stats.totalProjects}`,
      subtitle: 'completed',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      trend: stats.totalProjects > 0 && (stats.finishedProjects / stats.totalProjects) >= 0.5 ? 'good' : 'active'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingTasks.toString(),
      subtitle: 'future tasks',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
      trend: 'neutral'
    }
  ];

  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return <div className="w-2 h-2 bg-green-500 dark:bg-green-300 rounded-full shadow-sm"></div>;
      case 'good':
        return <div className="w-2 h-2 bg-blue-500 dark:bg-blue-300 rounded-full shadow-sm"></div>;
      case 'manageable':
        return <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-300 rounded-full shadow-sm"></div>;
      case 'critical':
      case 'declining':
        return <div className="w-2 h-2 bg-red-500 dark:bg-red-300 rounded-full shadow-sm"></div>;
      case 'busy':
        return <div className="w-2 h-2 bg-orange-500 dark:bg-orange-300 rounded-full shadow-sm"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full shadow-sm"></div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Lifetime Tracker</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-200">
          <CheckCircle size={16} />
          <span>Personal Analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={20} className={`${stat.color} dark:text-opacity-90`} />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIndicator(stat.trend)}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-200">{stat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
          {stats.completionRate >= 80 ? 'Excellent productivity!' : 
           stats.completionRate >= 60 ? 'Good progress, keep it up!' : 
           'Room for improvement - you got this!'}
        </p>
      </div>
    </div>
  );
};