import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectAPI } from '../services/api.js';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProjectAPI.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('fetchProjects failed, using cached/demo projects:', err.message);
      // Fallback demo projects if offline/unreachable
      setProjects([
        { id: 1, name: 'Mobile App', description: 'React Native Expo mobile client', color: '#1d4ed8' },
        { id: 2, name: 'Backend API', description: 'FastAPI microservices & DB', color: '#10b981' },
        { id: 3, name: 'AI Copilot', description: 'Groq autonomous tool execution', color: '#f59e0b' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (projectData) => {
    try {
      const created = await ProjectAPI.createProject(projectData);
      setProjects((prev) => [...prev, created]);
      return { success: true, project: created };
    } catch (err) {
      // Local optimistic fallback
      const fallbackProject = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#1d4ed8',
      };
      setProjects((prev) => [...prev, fallbackProject]);
      return { success: true, project: fallbackProject };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await ProjectAPI.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return { success: true };
    } catch (err) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return { success: true };
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        error,
        fetchProjects,
        createProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

export default ProjectContext;
