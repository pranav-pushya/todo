import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProjectAPI } from '../services/api';

const ProjectContext = createContext(null);

const DEFAULT_DEMO_PROJECTS = [
  { id: 1, name: 'Mobile App', description: 'React Native & Expo cross-platform mobile client', color: '#1d4ed8' },
  { id: 2, name: 'Backend API', description: 'FastAPI microservices & SQLite local database', color: '#10b981' },
  { id: 3, name: 'AI Copilot', description: 'Groq autonomous tool execution & agent workflows', color: '#f59e0b' },
];

const getStoredProjects = () => {
  try {
    const raw = localStorage.getItem('todo_local_projects');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local projects:', e);
  }
  return DEFAULT_DEMO_PROJECTS;
};

const saveStoredProjects = (projectsList) => {
  try {
    localStorage.setItem('todo_local_projects', JSON.stringify(projectsList));
  } catch (e) {
    console.warn('Error saving local projects:', e);
  }
};

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(getStoredProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('todo_auth_token');

    // 1. If not logged in, read from local browser storage
    if (!token) {
      setProjects(getStoredProjects());
      setLoading(false);
      return;
    }

    // 2. If logged in, fetch from backend with local cache fallback
    try {
      const data = await ProjectAPI.getProjects({ includeArchived: false });
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        saveStoredProjects(data);
      } else {
        const cached = getStoredProjects();
        if (cached.length > 0) {
          setProjects(cached);
        } else {
          setProjects(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.warn('Backend getProjects failed, serving local storage projects:', err.message);
      setProjects(getStoredProjects());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    const token = localStorage.getItem('todo_auth_token');

    if (!token) {
      const newProj = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#1d4ed8',
      };
      const updated = [...getStoredProjects(), newProj];
      saveStoredProjects(updated);
      setProjects(updated);
      return newProj;
    }

    try {
      const created = await ProjectAPI.createProject(projectData);
      const updated = [...getStoredProjects().filter((p) => p.id !== created.id), created];
      saveStoredProjects(updated);
      setProjects(updated);
      return created;
    } catch (err) {
      const fallback = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#1d4ed8',
      };
      const updated = [...getStoredProjects(), fallback];
      saveStoredProjects(updated);
      setProjects(updated);
      return fallback;
    }
  };

  const editProject = async (projectId, updates) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));

    const current = getStoredProjects();
    saveStoredProjects(current.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return updates;

    try {
      const updated = await ProjectAPI.updateProject(projectId, updates);
      return updated;
    } catch (err) {
      console.warn('API updateProject failed, preserved locally:', err.message);
      return updates;
    }
  };

  const removeProject = async (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }

    const current = getStoredProjects();
    saveStoredProjects(current.filter((p) => p.id !== projectId));

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return;

    try {
      await ProjectAPI.deleteProject(projectId);
    } catch (err) {
      console.warn('API deleteProject failed, removed locally:', err.message);
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

export default ProjectContext;
