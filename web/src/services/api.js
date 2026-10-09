/**
 * API Client Layer for communicating with FastAPI Backend
 * Uses Vite proxy forwarding /api to http://127.0.0.1:8001
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Generic fetch wrapper with centralized JSON serialization,
 * error parsing, and status code handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content has an empty body (e.g., successful DELETE)
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `HTTP Error ${response.status}: ${response.statusText}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

// ==================== TASK API ====================

export const TaskAPI = {
  /**
   * Fetch tasks with optional view filtering (inbox, today, upcoming, completed),
   * parent project_id, priority (P1-P4), search keyword, and pagination.
   */
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

  /**
   * Retrieve productivity analytics, streaks, and consistency stats.
   */
  async getAnalytics() {
    return request('/tasks/analytics');
  },

  /**
   * Retrieve single task details by ID.
   */
  async getTask(taskId) {
    return request(`/tasks/${taskId}`);
  },

  /**
   * Create a new task.
   */
  async createTask(taskData) {
    return request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  /**
   * Partial update for task fields (title, due_date, priority, etc.).
   */
  async updateTask(taskId, updates) {
    return request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Toggle task completion status (checked/unchecked).
   */
  async toggleTask(taskId) {
    return request(`/tasks/${taskId}/toggle`, {
      method: 'PATCH',
    });
  },

  /**
   * Permanently delete a task.
   */
  async deleteTask(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * AI Magic Subtasking: Deconstruct task into 15-minute actionable subtasks.
   */
  async deconstructTask(taskId) {
    return request(`/tasks/${taskId}/deconstruct`, {
      method: 'POST',
    });
  },

  /**
   * Add a manual subtask.
   */
  async addSubtask(taskId, subtaskData) {
    return request(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(subtaskData),
    });
  },

  /**
   * Toggle a subtask's completion status.
   */
  async toggleSubtask(taskId, subtaskId) {
    return request(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete a subtask.
   */
  async deleteSubtask(taskId, subtaskId) {
    return request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PROJECT API ====================

export const ProjectAPI = {
  /**
   * Retrieve all projects with task counts.
   */
  async getProjects({ includeArchived = false, skip = 0, limit = 100 } = {}) {
    const params = new URLSearchParams();
    if (includeArchived) params.append('include_archived', 'true');
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/projects/${query}`);
  },

  /**
   * Get single project details by ID.
   */
  async getProject(projectId) {
    return request(`/projects/${projectId}`);
  },

  /**
   * Get all tasks belonging to a specific project.
   */
  async getProjectTasks(projectId) {
    return request(`/projects/${projectId}/tasks`);
  },

  /**
   * Create a new project.
   */
  async createProject(projectData) {
    return request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Update project title, description, color, or archived status.
   */
  async updateProject(projectId, updates) {
    return request(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a project and cascade delete all its tasks.
   */
  async deleteProject(projectId) {
    return request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== AI AGENT API ====================

export const AgentAPI = {
  /**
   * Dispatch a natural language command prompt to the Groq AI agent.
   * Example: "Add high priority task 'Ship Phase 3' due tomorrow"
   */
  async sendCommand(prompt) {
    return request('/agent/command', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  /**
   * Retrieve autonomous execution audit history logs.
   */
  async getLogs(limit = 30) {
    return request(`/agent/logs?limit=${limit}`);
  },

  /**
   * Directly execute a registered agent tool.
   */
  async executeTool(toolName, parameters) {
    return request(`/agent/tool/${toolName}`, {
      method: 'POST',
      body: JSON.stringify(parameters),
    });
  },
};

// ==================== NOTE API ====================

export const NoteAPI = {
  /**
   * Fetch notes with optional search keyword and pinned filter.
   */
  async getNotes({ search, pinnedOnly = false, skip = 0, limit = 200 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (pinnedOnly) params.append('pinned_only', 'true');
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/notes/${query}`);
  },

  async getNote(noteId) {
    return request(`/notes/${noteId}`);
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

  async togglePin(noteId) {
    return request(`/notes/${noteId}/pin`, {
      method: 'PATCH',
    });
  },

  async deleteNote(noteId) {
    return request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Two-Way Synced Bridge: Open or generate a dedicated scratchpad note for a task.
   */
  async getTaskScratchpad(taskId) {
    return request(`/notes/scratchpad/${taskId}`, {
      method: 'POST',
    });
  },

  /**
   * Two-Way Synced Bridge: Extract `- [ ] ...` markdown checklist items into real To-Do tasks.
   */
  async syncChecklists(noteId) {
    return request(`/notes/${noteId}/sync-checklists`, {
      method: 'POST',
    });
  },
};

// ==================== AI/ML EXPERIMENT & WEBHOOK API ====================

export const MLAPI = {
  /**
   * Dispatch an experiment completion or training webhook.
   */
  async sendWebhook(payload) {
    return request('/ml/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieve list of logged experiment runs.
   */
  async getExperiments(limit = 50) {
    return request(`/ml/experiments?limit=${limit}`);
  },

  /**
   * Delete an experiment run record.
   */
  async deleteExperiment(experimentId) {
    return request(`/ml/experiments/${experimentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== AGILE SPRINT & BURNDOWN API ====================

export const SprintAPI = {
  /**
   * Get active sprint with assigned tasks.
   */
  async getActiveSprint() {
    return request('/sprints/active');
  },

  /**
   * Start a new sprint.
   */
  async createSprint(sprintData) {
    return request('/sprints/', {
      method: 'POST',
      body: JSON.stringify(sprintData),
    });
  },

  /**
   * Assign task to sprint.
   */
  async addTaskToSprint(sprintId, taskId) {
    return request(`/sprints/${sprintId}/tasks/${taskId}`, {
      method: 'POST',
    });
  },

  /**
   * Get ideal vs actual burndown series.
   */
  async getBurndown(sprintId) {
    return request(`/sprints/${sprintId}/burndown`);
  },

  /**
   * Mark sprint completed.
   */
  async completeSprint(sprintId) {
    return request(`/sprints/${sprintId}/complete`, {
      method: 'PATCH',
    });
  },
};



