import { Task, Project, ProjectStatus } from './types';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isPast = (date: Date): boolean => {
  const now = new Date();
  
  // Special handling for holding tasks (11:59 PM)
  if (date.getHours() === 23 && date.getMinutes() === 59) {
    // For holding tasks, consider them overdue if it's the same day or the date has passed
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0); // Reset to start of day
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    return taskDate <= today; // Changed from < to <= so same day is considered overdue
  }
  
  return date < now;
};

export const getProjectStatus = (project: Project, tasks: Task[], allProjects: Project[] = []): ProjectStatus => {
  // SPECIAL RULE: Inbox project has different status logic
  const isInbox = project.name === 'Inbox' && !project.parent_id;
  
  if (isInbox) {
    // For Inbox: Only go to "review" if there are overdue tasks
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const incompleteTasks = projectTasks.filter(task => !task.completed);
    const overdueTasks = incompleteTasks.filter(task => isPast(new Date(task.deadline)));
    
    if (overdueTasks.length > 0) {
      return 'unreported'; // Review needed due to overdue tasks
    }
    
    // Inbox is always "done" unless it has overdue tasks
    // It should never appear in the Active section
    return 'done';
  }
  
  // If project is manually marked as finished, it's done
  if (project.status === 'finished') {
    return 'done';
  }
  
  const projectTasks = tasks.filter(task => task.project_id === project.id);
  const subProjects = allProjects.filter(p => p.parent_id === project.id);
  
  // Get status of all sub-projects recursively
  const subProjectStatuses = subProjects.map(subProject => 
    getProjectStatus(subProject, tasks, allProjects)
  );
  
  // RULE 1: If ANY sub-project needs review, parent project needs review
  if (subProjectStatuses.some(status => status === 'unreported')) {
    return 'unreported';
  }
  
  // Get this project's tasks
  const incompleteTasks = projectTasks.filter(task => !task.completed);
  const overdueTasks = incompleteTasks.filter(task => isPast(new Date(task.deadline)));
  
  // RULE 2: If project has overdue tasks, it needs review
  if (overdueTasks.length > 0) {
    return 'unreported';
  }
  
  // RULE 3: If project has no tasks at all, it needs review (stagnant project)
  if (projectTasks.length === 0 && subProjects.length === 0) {
    return 'unreported';
  }
  
  // RULE 4: If project has incomplete tasks with future deadlines, it's live
  const futureTasks = incompleteTasks.filter(task => !isPast(new Date(task.deadline)));
  if (futureTasks.length > 0) {
    return 'live';
  }
  
  // RULE 5: If any sub-project is live, this project is live
  if (subProjectStatuses.some(status => status === 'live')) {
    return 'live';
  }
  
  // RULE 6: If project has only completed tasks and no active sub-projects, 
  // but isn't manually marked as finished, it needs review
  if (projectTasks.length > 0 && incompleteTasks.length === 0 && subProjectStatuses.every(status => status === 'done')) {
    return 'unreported';
  }
  
  // RULE 7: If project has sub-projects but no direct tasks, 
  // and all sub-projects are done, it needs review
  if (projectTasks.length === 0 && subProjects.length > 0 && subProjectStatuses.every(status => status === 'done')) {
    return 'unreported';
  }
  
  // Default fallback - if we get here, something needs attention
  return 'unreported';
};

// Helper function to check if a project is truly finished (for display purposes only)
export const isProjectFinished = (project: Project): boolean => {
  return project.status === 'finished';
};

// Helper function to get display status (including manual finish state)
export const getDisplayStatus = (project: Project, tasks: Task[], allProjects: Project[] = []): ProjectStatus | 'finished' => {
  if (project.status === 'finished') {
    return 'finished';
  }
  
  return getProjectStatus(project, tasks, allProjects);
};

export const getStatusColorForDisplay = (status: ProjectStatus | 'finished'): string => {
  switch (status) {
    case 'live':
      return 'bg-green-500';
    case 'unreported':
      return 'bg-yellow-500';
    case 'done':
      return 'bg-gray-500';
    case 'finished':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusTextColorForDisplay = (status: ProjectStatus | 'finished'): string => {
  switch (status) {
    case 'live':
      return 'text-green-600 dark:text-green-300';
    case 'unreported':
      return 'text-yellow-600 dark:text-yellow-300';
    case 'done':
      return 'text-gray-600 dark:text-gray-200';
    case 'finished':
      return 'text-blue-600 dark:text-blue-300';
    default:
      return 'text-gray-600 dark:text-gray-200';
  }
};

export const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'live':
      return 'bg-green-500';
    case 'unreported':
      return 'bg-yellow-500';
    case 'done':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusTextColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'live':
      return 'text-green-600';
    case 'unreported':
      return 'text-yellow-600';
    case 'done':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const getWeekDays = (): Date[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day; // First day is Sunday
  startOfWeek.setDate(diff);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push(date);
  }
  
  return days;
};

export const getTimeSlots = (): string[] => {
  const slots: string[] = [];
  // Add hours from 6 AM to 11 PM (midnight)
  for (let hour = 6; hour <= 23; hour++) {
    const time12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${time12}:00 ${ampm}`);
  }
  return slots;
};

export const getTasksForTimeSlot = (tasks: Task[], date: Date, hour: number): Task[] => {
  return tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    // Exclude holding tasks (11:59 PM) from regular time slots
    const isHoldingTask = taskDate.getHours() === 23 && taskDate.getMinutes() === 59;
    if (isHoldingTask) return false;
    
    return taskDate.toDateString() === date.toDateString() && 
           taskDate.getHours() === hour;
  });
};

export const getHoldingTasks = (tasks: Task[], date: Date): Task[] => {
  return tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === date.toDateString() && 
           taskDate.getHours() === 23 && 
           taskDate.getMinutes() === 59; // Use 11:59 PM as holding time
  });
};

export const convertTimeStringToHour = (timeString: string): number => {
  const [time, period] = timeString.split(' ');
  const [hourStr] = time.split(':');
  let hour = parseInt(hourStr);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour;
};

export const convertTimeSlotTo24Hour = (timeSlot: string): string => {
  const [time, period] = timeSlot.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minuteStr}`;
};

export const getTomorrowDateAt6AM = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    date: tomorrow.toISOString().split('T')[0],
    time: '06:00'
  };
};

export const getTimeSlotFromTime = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr);
  const minute = minuteStr;
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
};

// New function to display time without AM/PM for frontend
export const formatTimeSlotForDisplay = (timeSlot: string): string => {
  const [time, period] = timeSlot.split(' ');
  const [hourStr] = time.split(':');
  return hourStr;
};

export const getTodayDateAtEndOfDay = (): string => {
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  return today.toISOString();
};