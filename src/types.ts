export interface Task {
  id: string;
  title: string;
  deadline: string; // ISO string for database compatibility
  completed: boolean;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  parent_id?: string | null;
  next_step?: string | null;
  status?: string | null;
}

export type ProjectStatus = 'live' | 'unreported' | 'done';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}