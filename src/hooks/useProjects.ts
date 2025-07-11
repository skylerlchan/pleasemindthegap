import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export const useProjects = (userId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    initializeProjects();
  }, [userId]);

  const initializeProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const projectsData = data || [];
      
      // Check if Inbox project exists
      const inboxProject = projectsData.find(p => p.name === 'Inbox' && !p.parent_id);
      
      if (!inboxProject) {
        // Create Inbox project if it doesn't exist
        const { data: newInbox, error: inboxError } = await supabase
          .from('projects')
          .insert([{ 
            name: 'Inbox', 
            color: 'bg-gray-500', 
            user_id: userId 
          }])
          .select()
          .single();

        if (inboxError) throw inboxError;
        
        // Add the new Inbox to the beginning of the projects array
        setProjects([newInbox, ...projectsData]);
      } else {
        // Move Inbox to the beginning if it exists
        const otherProjects = projectsData.filter(p => p.id !== inboxProject.id);
        setProjects([inboxProject, ...otherProjects]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const projectsData = data || [];
      const inboxProject = projectsData.find(p => p.name === 'Inbox' && !p.parent_id);
      
      if (inboxProject) {
        // Move Inbox to the beginning
        const otherProjects = projectsData.filter(p => p.id !== inboxProject.id);
        setProjects([inboxProject, ...otherProjects]);
      } else {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const addProject = async (projectData: { name: string; color: string; parent_id?: string }) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      
      // Add new project after Inbox
      setProjects(prev => {
        const inbox = prev.find(p => p.name === 'Inbox' && !p.parent_id);
        if (inbox) {
          return [inbox, data, ...prev.filter(p => p.id !== inbox.id)];
        }
        return [...prev, data];
      });
      return data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Maintain Inbox at the beginning
      setProjects(prev => {
        const updated = prev.map(p => p.id === id ? data : p);
        const inbox = updated.find(p => p.name === 'Inbox' && !p.parent_id);
        if (inbox) {
          const others = updated.filter(p => p.id !== inbox.id);
          return [inbox, ...others];
        }
        return updated;
      });
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    // Prevent deletion of Inbox project
    const project = projects.find(p => p.id === id);
    if (project?.name === 'Inbox' && !project.parent_id) {
      throw new Error('Cannot delete the Inbox project');
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const getInboxProject = () => {
    return projects.find(p => p.name === 'Inbox' && !p.parent_id);
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
    getInboxProject
  };
};