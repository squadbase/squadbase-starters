'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project } from '@/src/db/schema';

interface ProjectsContextValue {
  projects: Project[];
  isLoading: boolean;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (response.ok) {
        const newProject = await response.json();
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      }
      throw new Error('Failed to create project');
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        return updatedProject;
      }
      throw new Error('Failed to update project');
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }, []);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects,
        getProjectById,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
}