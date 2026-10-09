import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectAPI } from '../services/api';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProjectAPI.getProjects({ includeArchived: false });
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    try {
      const created = await ProjectAPI.createProject(projectData);
      setProjects((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editProject = async (projectId, updates) => {
    try {
      const updated = await ProjectAPI.updateProject(projectId, updates);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeProject = async (projectId) => {
    try {
      await ProjectAPI.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        loading,
        error,
        fetchProjects,
        addProject,
        editProject,
        removeProject,
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
