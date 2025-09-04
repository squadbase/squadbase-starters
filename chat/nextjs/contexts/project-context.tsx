'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Project } from '@/src/db/schema';

interface ProjectContextValue {
  currentProject: Project | null;
  isInProject: boolean;
  isLoading: boolean;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const isInProject = Boolean(projectId);

  const refreshProject = async () => {
    if (!projectId) {
      setCurrentProject(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const project = await response.json();
        setCurrentProject(project);
      } else {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setCurrentProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInProject) {
      refreshProject();
    } else {
      setCurrentProject(null);
      setIsLoading(false);
    }
  }, [projectId, isInProject]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        isInProject,
        isLoading,
        refreshProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}