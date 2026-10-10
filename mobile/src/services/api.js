import storage from './storage.js';

export const SERVER_PRESETS = [
  { id: 'render', label: 'Render Cloud (Production)', url: 'https://kortex-xnin.onrender.com/api/v1' },
  { id: 'emulator', label: 'Android Emulator (10.0.2.2:8001)', url: 'http://10.0.2.2:8001/api/v1' },
  { id: 'simulator', label: 'iOS Simulator (localhost:8001)', url: 'http://localhost:8001/api/v1' },
  { id: 'local_lan', label: 'Local LAN (192.168.1.100:8001)', url: 'http://192.168.1.100:8001/api/v1' },
];

let activeBaseUrl = SERVER_PRESETS[0].url; // Default to production Render API

export async function initApiHost() {
  const saved = await storage.getItem('kortex_api_host');
  if (saved) {
    activeBaseUrl = saved;
  }
  return activeBaseUrl;
}

export function getActiveHost() {
  return activeBaseUrl;
}

export async function setActiveHost(url) {
  activeBaseUrl = url;
  await storage.setItem('kortex_api_host', url);
  return activeBaseUrl;
}

async function request(endpoint, options = {}) {
  const token = await storage.getItem('kortex_auth_token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const url = `${activeBaseUrl}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    let data = null;
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const errorMsg =
        data?.detail ||
        (typeof data === 'string' ? data : null) ||
        `HTTP Error ${response.status}: ${response.statusText || 'Request failed'}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Check network or server status.');
    }
    console.warn(`[Mobile API] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ==================== TASK API ====================
export const TaskAPI = {
  async getTasks({ view, projectId, priority, search, skip = 0, limit = 200 } = {}) {
    const params = new URLSearchParams();
    if (view) params.append('view', view);
    if (projectId !== undefined && projectId !== null) params.append('project_id', projectId);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/tasks/${query}`);
  },

  async createTask(taskData) {
    return request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(taskId, updates) {
    return request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async toggleTask(taskId, completed) {
    return request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },
};

// ==================== PROJECT API ====================
export const ProjectAPI = {
  async getProjects() {
    return request('/projects/');
  },

  async createProject(projectData) {
    return request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async deleteProject(projectId) {
    return request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== NOTE API ====================
export const NoteAPI = {
  async getNotes() {
    return request('/notes/');
  },

  async createNote(noteData) {
    return request('/notes/', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async updateNote(noteId, updates) {
    return request(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteNote(noteId) {
    return request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  async syncChecklists(noteId) {
    return request(`/notes/${noteId}/sync-checklists`, {
      method: 'POST',
    });
  },
};

// ==================== AGENT API ====================
export const AgentAPI = {
  async executeCommand(prompt) {
    return request('/agent/command', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  async getAuditLogs(limit = 20) {
    return request(`/agent/audit-logs?limit=${limit}`);
  },
};

// ==================== AUTH API ====================
export const AuthAPI = {
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const url = `${activeBaseUrl}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Authentication failed');
    }

    if (data.access_token) {
      await storage.setItem('kortex_auth_token', data.access_token);
    }
    return data;
  },

  async register(username, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async getProfile() {
    return request('/auth/me');
  },

  async logout() {
    await storage.removeItem('kortex_auth_token');
    await storage.removeItem('kortex_user_profile');
  },
};

// ==================== HEALTH API ====================
export const HealthAPI = {
  async checkHealth() {
    return request('/health');
  },
};

export default {
  TaskAPI,
  ProjectAPI,
  NoteAPI,
  AgentAPI,
  AuthAPI,
  HealthAPI,
  getActiveHost,
  setActiveHost,
  SERVER_PRESETS,
};
