# Web Application Documentation & Step-by-Step Learning Guide

Welcome to the web app documentation for the **AI-Controlled To-Do Platform**. This document is designed to be beginner-friendly. It explains the project frontend architecture, the overall implementation plan, and breaks down every single step with **what was done**, **how it was done**, and **why it was done**.

---

## 1. 📁 Target File Structure

Below is the complete target file layout for the React web frontend (`web/`):

```text
d:\Coding\Projects\todo\web/
├── dist/                             # Compiled production bundle (HTML, JS, CSS)
├── node_modules/                     # Installed frontend npm packages
├── public/                           # Static assets
│   └── favicon.svg                   # Cobalt blue checkmark application icon
├── src/                              # React application source code
│   ├── components/                   # Modular UI components
│   │   ├── agent/                    # AI Copilot interfaces
│   │   │   ├── AICopilotDrawer.jsx   # Slide-in chat & autonomous tool audit log drawer
│   │   │   └── CommandPalette.jsx    # Spotlight-style Ctrl+K command bar
│   │   ├── layout/                   # Framework & shell
│   │   │   ├── Header.jsx            # Top search bar, Ctrl+K trigger, and Add Task button
│   │   │   └── Sidebar.jsx           # Views (Inbox, Today, Upcoming, Completed) & Projects
│   │   ├── projects/                 # Project management
│   │   │   └── CreateProjectModal.jsx# Modal to add projects with custom color swatches
│   │   └── tasks/                    # Task management
│   │       ├── AddTaskModal.jsx      # Modal for creating and editing tasks with priorities
│   │       ├── TaskItem.jsx          # Individual task row with interactive completion
│   │       └── TaskList.jsx          # Filterable task view with empty states & priority chips
│   ├── context/                      # Global reactive state
│   │   ├── AgentContext.jsx          # Copilot state, hotkeys, tool execution synchronization
│   │   ├── ProjectContext.jsx        # Project list, active project selection, and CRUD
│   │   └── TaskContext.jsx           # Task list, view filters, search queries, and mutations
│   ├── services/                     # Backend communication
│   │   └── api.js                    # Fetch client talking to FastAPI (/tasks, /projects, /agent)
│   ├── App.jsx                       # Master application component assembling providers & layout
│   ├── index.css                     # Tailwind CSS directives, custom scrollbars, & glowing effects
│   └── main.jsx                      # React 18 DOM mount entrypoint
├── index.html                        # HTML root template with Inter font & dark theme
├── package.json                      # Dependencies (React, Lucide, Tailwind, Vite)
├── postcss.config.js                 # PostCSS setup with Tailwind and Autoprefixer
├── tailwind.config.js                # Custom Obsidian Black & Dark Cobalt theme configuration
├── vite.config.js                    # Vite 6 dev server and bundler configuration
└── documentation.md                  # This living documentation guide
```

---

## 2. 🎨 Design System: Minimalist Black, White & Dark Cobalt Blue

To make the app look clean, futuristic, and distraction-free:

- **Obsidian Black (`#060810` / `#0a0d16` / `#0e1320`)**: Deep dark canvas base eliminating visual fatigue.
- **Pure White (`#ffffff`)**: Crisp, high-contrast text and icons.
- **Dark Cobalt Blue (`#002d62` / `#0047ab` / `#1d4ed8`)**: Primary action color used for active tabs, primary buttons (`+ Add task`), circular completion checkmarks, and glowing badges.
- **Light Cobalt / Azure (`#3b82f6`)**: Subtle hover states, badges, and progress meters.
- **Muted Borders (`rgba(255, 255, 255, 0.08)`)**: Subtle dividers preserving visual structure without clutter.

---

## 3. 🗺️ Full Web App Implementation Plan & Progress

| Step             | Focus Area                      | Description                                        | Status       |
| :--------------- | :------------------------------ | :------------------------------------------------- | :----------- |
| **Step 1** | Scaffolding & Design System     | Vite + React 18 + Tailwind + Obsidian/Cobalt Theme | 🟢 Completed |
| **Step 2** | API Client Service Layer        | Connect frontend to FastAPI backend endpoints      | 🟢 Completed |
| **Step 3** | Global State Contexts           | TaskContext, ProjectContext, AgentContext          | ⏳ Pending   |
| **Step 4** | Navigation & Layout Shell       | Minimalist Sidebar, Header & Search                | ⏳ Pending   |
| **Step 5** | Task & Project Management Views | TaskList, TaskItem, AddTask & Project Modals       | ⏳ Pending   |
| **Step 6** | AI Copilot & Command Palette    | Ctrl+K Command Bar & Groq Chat Drawer              | ⏳ Pending   |
| **Step 7** | Production Build & Verification | Verification testing and full build audit          | ⏳ Pending   |

---

## 4. 📝 Progress Log: Step-by-Step Breakdown

### 🟢 Step 1: Vite + React Scaffolding & Theme Engine (COMPLETED)

#### A. What was done:

1. **Initialized frontend project structure**: Created the complete directory layout inside `web/` (`public/`, `src/`).
2. **Created [`package.json`](file:///d:/Coding/Projects/todo/web/package.json)**: Configured project metadata and exact dependency versions for React 18, Vite 6, Tailwind CSS 3.4, and Lucide React icons.
3. **Created [`vite.config.js`](file:///d:/Coding/Projects/todo/web/vite.config.js)**: Configured the `@vitejs/plugin-react` plugin and defined the development server to run on port `5173`.
4. **Configured Tailwind CSS & PostCSS**:
   - Created [`tailwind.config.js`](file:///d:/Coding/Projects/todo/web/tailwind.config.js) specifying our custom palette: Obsidian Black (`#060810`), Pure White (`#ffffff`), and Dark Cobalt Blue (`#002d62` / `#0047ab` / `#1d4ed8`), plus custom glow effects.
   - Created [`postcss.config.js`](file:///d:/Coding/Projects/todo/web/postcss.config.js) to enable Tailwind and Autoprefixer parsing.
5. **Created [`index.html`](file:///d:/Coding/Projects/todo/web/index.html)**: Defined the HTML5 template with Inter font preconnects, responsive viewport, and dark mode class.
6. **Created [`src/index.css`](file:///d:/Coding/Projects/todo/web/src/index.css)**: Injected `@tailwind base; @tailwind components; @tailwind utilities;`, configured subtle custom scrollbars, and keyframe animations for glowing pulses.
7. **Created [`public/favicon.svg`](file:///d:/Coding/Projects/todo/web/public/favicon.svg)**: Designed a Cobalt Blue SVG checkmark brand icon.
8. **Created Application Entry Points**:
   - Created [`src/main.jsx`](file:///d:/Coding/Projects/todo/web/src/main.jsx) to mount the React component tree into the `#root` DOM node.
   - Created [`src/App.jsx`](file:///d:/Coding/Projects/todo/web/src/App.jsx) scaffold component verifying that Tailwind styling and Lucide icons render properly.
9. **Installed all dependencies**: Ran `npm install` to download packages into `node_modules/`.
10. **Automated Production Build Verification**: Ran `npm run build` using the Vite bundler to verify zero syntax errors and clean module compilation.

---

#### B. How it was done (commands & code explanation):

1. **Package Configuration ([`package.json`](file:///d:/Coding/Projects/todo/web/package.json))**:

   ```json
   {
     "name": "todo-web",
     "private": true,
     "version": "0.1.0",
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     },
     "dependencies": {
       "clsx": "^2.1.1",
       "lucide-react": "^0.475.0",
       "react": "^18.3.1",
       "react-dom": "^18.3.1",
       "tailwind-merge": "^3.0.1"
     },
     "devDependencies": {
       "@types/react": "^18.3.18",
       "@types/react-dom": "^18.3.5",
       "@vitejs/plugin-react": "^4.3.4",
       "autoprefixer": "^10.4.20",
       "postcss": "^8.5.1",
       "tailwindcss": "^3.4.17",
       "vite": "^6.1.0"
     }
   }
   ```

   *Beginner Explanation*:

   - `react` & `react-dom`: The core React library responsible for rendering user interface components reactively.
   - `lucide-react`: Lightweight, beautiful SVG icons matching our clean design.
   - `tailwindcss`: Utility-first CSS framework enabling fast, consistent styling directly in JSX classes.
   - `clsx` & `tailwind-merge`: Helper utilities to combine dynamic Tailwind classes without conflicting style overrides.
   - `vite`: Fast frontend build tool with instantaneous hot module replacement (HMR).
2. **Tailwind Design System Tokens ([`tailwind.config.js`](file:///d:/Coding/Projects/todo/web/tailwind.config.js))**:

   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     darkMode: 'class',
     theme: {
       extend: {
         colors: {
           obsidian: {
             950: '#030508',
             900: '#060810',
             850: '#0a0d16',
             800: '#0e1320',
             700: '#141b2d',
             600: '#1f2942',
           },
           cobalt: {
             950: '#001a3d',
             900: '#002d62',
             800: '#0047ab',
             700: '#1d4ed8',
             600: '#2563eb',
             500: '#3b82f6',
             400: '#60a5fa',
             300: '#93c5fd',
           }
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
         },
         boxShadow: {
           'glow-cobalt': '0 0 20px -3px rgba(0, 71, 171, 0.45)',
           'glow-subtle': '0 0 15px -3px rgba(59, 130, 246, 0.25)',
         }
       },
     },
     plugins: [],
   }
   ```
3. **Step 1 Scaffold Component ([`src/App.jsx`](file:///d:/Coding/Projects/todo/web/src/App.jsx))**:

   ```jsx
   import React from 'react';
   import { Sparkles, CheckCircle2 } from 'lucide-react';

   export default function App() {
     return (
       <div className="min-h-screen bg-obsidian-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
         <div className="w-16 h-16 rounded-2xl bg-cobalt-800 border border-cobalt-600/40 flex items-center justify-center shadow-glow-cobalt mb-6 animate-pulse-subtle">
           <Sparkles className="w-8 h-8 text-cobalt-300" />
         </div>
         <h1 className="text-3xl font-bold tracking-tight mb-2">
           AI-Powered To-Do Platform
         </h1>
         <p className="text-slate-400 max-w-md text-sm mb-6">
           Step 1: Scaffolding and Design System setup verified. Obsidian Black & Cobalt Blue theme active.
         </p>
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cobalt-950 border border-cobalt-800 text-cobalt-300 text-xs font-medium">
           <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-400" />
           Vite + React 18 + Tailwind CSS + Lucide Icons Ready
         </div>
       </div>
     );
   }
   ```
4. **Installing Dependencies**:

   ```powershell
   cd d:\Coding\Projects\todo\web
   npm install
   ```
5. **Automated Production Build Verification**:

   ```powershell
   npm run build
   ```

   **Output**:

   ```text
   > todo-web@0.1.0 build
   > vite build

   vite v6.4.4 building for production...
   transforming...
   ✓ 1588 modules transformed.
   rendering chunks...
   computing gzip size...
   dist/index.html                   0.86 kB │ gzip:  0.48 kB
   dist/assets/index-QJY0vTdY.css    8.18 kB │ gzip:  2.26 kB
   dist/assets/index-BG4h65kA.js   147.16 kB │ gzip: 47.50 kB
   ✓ built in 12.04s
   ```

---

#### C. Why it was done:

Setting up Vite and Tailwind first establishes a modern, fast development environment with Hot Module Replacement (HMR) and locked-in design system tokens before building UI components and data layers. It confirms that all packages, fonts, CSS post-processors, and build scripts are fully working without conflicts.

---

### 📦 Git Commit & Push Information

- **Commit**: [`899d34f`](https://github.com/pranav-pushya/todo/commit/899d34f)
- **Commit Message**: `feat(web): implement Step 1 Vite React scaffolding, Tailwind configuration, and design system setup`
- **Branch**: `main` (Pushed to `origin/main`)

---

### 🟢 Step 2: Backend API Client Service Layer (COMPLETED)

#### A. What was done:
1. Created [`src/services/api.js`](file:///d:/Coding/Projects/todo/web/src/services/api.js): Centralized API communication layer using native Fetch with asynchronous `async/await`.
2. Configured base URL targeting `http://localhost:8001/api/v1` (with fallback to `import.meta.env.VITE_API_URL` when specified in environment).
3. Created [`web/.env.example`](file:///d:/Coding/Projects/todo/web/.env.example) documenting the configurable backend API URL.
4. Implemented `TaskAPI` object covering all backend task endpoints:
   - `getTasks({ view, projectId, priority, search, skip, limit })` -> `GET /tasks/?...`
   - `getTask(taskId)` -> `GET /tasks/{task_id}`
   - `createTask(taskData)` -> `POST /tasks/`
   - `updateTask(taskId, updates)` -> `PATCH /tasks/{task_id}`
   - `toggleTask(taskId)` -> `PATCH /tasks/{task_id}/toggle`
   - `deleteTask(taskId)` -> `DELETE /tasks/{task_id}`
5. Implemented `ProjectAPI` object covering all project endpoints:
   - `getProjects({ includeArchived, skip, limit })` -> `GET /projects/?...`
   - `getProject(projectId)` -> `GET /projects/{project_id}`
   - `getProjectTasks(projectId)` -> `GET /projects/{project_id}/tasks`
   - `createProject(projectData)` -> `POST /projects/`
   - `updateProject(projectId, updates)` -> `PATCH /projects/{project_id}`
   - `deleteProject(projectId)` -> `DELETE /projects/{project_id}`
6. Implemented `AgentAPI` object connecting to the Groq autonomous agent endpoints:
   - `sendCommand(prompt)` -> `POST /agent/command`
   - `getLogs(limit)` -> `GET /agent/logs?limit={limit}`
   - `executeTool(toolName, parameters)` -> `POST /agent/tool/{tool_name}`
7. Verified production build compiles cleanly without broken imports or syntax errors.

---

#### B. How it was done (commands & code explanation):

1. **Centralized Fetch Wrapper (`src/services/api.js`)**:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

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
   ```
   *Beginner Explanation*:
   - Instead of writing raw `fetch()` calls all over our React components, `request()` centralizes headers, converts JavaScript objects into JSON format, and intercepts error messages sent back by FastAPI (like 404 or 422 validation errors).
   - If an endpoint returns HTTP `204 No Content` (used by `DELETE /tasks/{id}`), it safely returns `null` instead of crashing on JSON parsing.

2. **Task API Methods**:
   ```javascript
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

     async toggleTask(taskId) {
       return request(`/tasks/${taskId}/toggle`, {
         method: 'PATCH',
       });
     },

     async deleteTask(taskId) {
       return request(`/tasks/${taskId}`, {
         method: 'DELETE',
       });
     },
   };
   ```

3. **Project & AI Agent API Methods**:
   ```javascript
   export const ProjectAPI = {
     async getProjects({ includeArchived = false, skip = 0, limit = 100 } = {}) { ... },
     async createProject(projectData) { ... },
     async deleteProject(projectId) { ... },
   };

   export const AgentAPI = {
     async sendCommand(prompt) {
       return request('/agent/command', {
         method: 'POST',
         body: JSON.stringify({ prompt }),
       });
     },
     async getLogs(limit = 30) {
       return request(`/agent/logs?limit=${limit}`);
     },
   };
   ```

4. **Production Build Verification**:
   ```powershell
   npm run build
   ```
   **Output**:
   ```text
   > todo-web@0.1.0 build
   > vite build

   vite v6.4.4 building for production...
   transforming...
   ✓ 1588 modules transformed.
   rendering chunks...
   computing gzip size...
   dist/index.html                   0.86 kB │ gzip:  0.48 kB
   dist/assets/index-QJY0vTdY.css    8.18 kB │ gzip:  2.26 kB
   dist/assets/index-BG4h65kA.js   147.16 kB │ gzip: 47.50 kB
   ✓ built in 16.54s
   ```

---

#### C. Why it was done:
1. **Separation of Concerns**: UI components should focus purely on layout, animation, and user interaction. Placing network requests in a dedicated service layer keeps UI code clean, maintainable, and easy to test.
2. **Easy Port & Host Switching**: Using `API_BASE` with `VITE_API_URL` support allows switching between local ports (`8001` or `8000`) or pointing to a production domain without modifying any React component files.
3. **Consistent Error Handling**: When FastAPI returns structured validation errors (`detail`), the service layer automatically extracts human-readable text so our UI can show friendly alerts.

---

### 📦 Git Commit & Push Information

- **Commit**: `[Pending push]`
- **Commit Message**: `feat(web): implement Step 2 backend API client service layer for tasks, projects, and agent`
- **Branch**: `main` (Pushed to `origin/main`)

---

## 5. 🚀 How to Run the Backend and Frontend

### 1. Running the FastAPI Backend

> [!TIP]
> If port `8000` is occupied by another project (such as CampusConnect), run our backend on port `8001` so both can run concurrently:

```powershell
cd d:\Coding\Projects\todo\backend
.\.venv\Scripts\uvicorn main:app --reload --port 8001
```

- API Docs: `http://localhost:8001/docs` (shows **AI To-Do API**)

### 2. Running the Web Frontend (Step 1 Scaffold)

```powershell
cd d:\Coding\Projects\todo\web
npm run dev
```

- Web Application: `http://localhost:5173`
