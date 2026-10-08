# Web Application Documentation & Step-by-Step Learning Guide

Welcome to the web app documentation for the **AI-Controlled To-Do Platform**. This document is written in beginner-friendly language to guide you through the frontend architecture, design system, and implementation steps.

---

## 1. 📁 Target File Structure

Below is the planned target structure for the React web frontend (`web/`):

```text
d:\Coding\Projects\todo\web/
├── public/                       # Static public assets (icons, favicon, etc.)
│   └── favicon.svg
├── src/                          # Application source code
│   ├── assets/                   # Images, sounds, and icons
│   ├── components/               # Reusable UI pieces
│   │   ├── common/               # Basic elements (Button, Input, Badge, Modal)
│   │   ├── layout/               # Header, Sidebar, Container
│   │   ├── tasks/                # TaskItem, TaskList, AddTaskModal, TaskFilter
│   │   ├── projects/             # ProjectCard, ProjectSidebarList, CreateProjectModal
│   │   └── agent/                # AICopilotDrawer, VoiceCommandBar, ActionFeed
│   ├── context/                  # Global state management (TaskContext, ThemeContext)
│   ├── hooks/                    # Custom React hooks (useTasks, useProjects, useAgent)
│   ├── services/                 # API connection to FastAPI backend
│   │   └── api.js                # Fetch/Axios helper functions (GET /tasks, POST /tasks)
│   ├── styles/                   # Global CSS and Tailwind definitions
│   │   └── index.css             # Obsidian, White & Dark Cobalt color tokens
│   ├── App.jsx                   # Main React page displaying sidebar and views
│   └── main.jsx                  # React application entry point
├── index.html                    # Root HTML file
├── package.json                  # Node.js dependencies (React, Lucide icons, Tailwind)
├── tailwind.config.js            # Tailwind CSS styling configuration
├── vite.config.js                # Vite build and development server configuration
└── documentation.md              # This living documentation guide
```

---

## 2. 🎨 Design System: Minimalist Black, White & Dark Cobalt Blue

To make the app look clean, futuristic, and distraction-free:
- **Obsidian Black (`#060810` / `#000000`)**: Deep dark canvas base eliminating visual clutter.
- **Pure White (`#ffffff`)**: Crisp, high-contrast text and icons.
- **Dark Cobalt Blue (`#002d62` / `#0047ab` / `#1d4ed8`)**: Primary action color used for active tabs, primary buttons (`+ Add task`), priority highlights, and circular progress rings.
- **Light Cobalt / Azure (`#3b82f6`)**: Subtle hover states, badges, and progress meters.

---

## 3. 🗺️ Full Web App Implementation Plan

### Step 1: Vite + React Project Scaffolding
- Initialize a fast React application using Vite.
- Install dependencies: `lucide-react` (clean minimalist icons), `clsx`, `tailwind-merge`.
- Set up Tailwind CSS with our custom Black, White, and Dark Cobalt color palette.

### Step 2: Backend API Service Layer (`src/services/api.js`)
- Write lightweight helper functions to talk directly to the FastAPI server (`http://localhost:8000/api/v1`):
  - `fetchTasks(filter)`
  - `createTask(data)`
  - `toggleTask(id)`
  - `deleteTask(id)`
  - `fetchProjects()`
  - `sendAgentCommand(prompt)`

### Step 3: Global State Management (`src/context/`)
- Create React Context so any button or screen can immediately update the task list without page refreshes.

### Step 4: Core Navigation & Layout (`src/components/layout/`)
- Collapsible Sidebar with links to:
  - **Inbox**: Tasks without an assigned project.
  - **Today**: Tasks due today.
  - **Upcoming**: Tasks scheduled for the future.
  - **My Projects**: Color-coded project lists.
- Minimalist Top Bar with quick search, theme toggle, and AI Copilot trigger.

### Step 5: Task Management UI (`src/components/tasks/`)
- Fast `+ Add task` modal / inline input with priority selector (`P1`, `P2`, `P3`, `P4`) and due-date picker.
- Interactive task list with animated checkmark completion, tags, and swipe/hover action buttons.

### Step 6: AI Copilot Drawer & Command Palette (`src/components/agent/`)
- Slide-out drawer to chat with the backend AI agent.
- `Ctrl + K` global command bar: Type natural language instructions like:
  - *"Add a P1 task 'Fix security audit' due tomorrow under Project Alpha"*
  - *"Reschedule overdue tasks to Friday"*
- Visual feedback showing the exact actions the AI agent performed in the database.

### Step 7: Build & Verification
- Verify responsive layout across mobile and desktop browser viewports.
- Run `npm run build` to confirm zero lint or compilation errors.

---

## 4. 📝 Progress Log: Step-by-Step Breakdown

*Status: Planned (Will begin after Phase 1 & 2 backend core are verified).*

| Step | Description | Status |
| :--- | :--- | :--- |
| **Step 1** | Vite + React + Tailwind Scaffolding | ⏳ Pending |
| **Step 2** | API Client Service Layer | ⏳ Pending |
| **Step 3** | Global State Context | ⏳ Pending |
| **Step 4** | Navigation Layout & Sidebar | ⏳ Pending |
| **Step 5** | Task & Project Management Views | ⏳ Pending |
| **Step 6** | AI Copilot Chat Drawer & Quick Bar | ⏳ Pending |
| **Step 7** | Production Build & Integration Test | ⏳ Pending |

---

*This document will be updated as soon as web app development begins.*
