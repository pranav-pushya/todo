# Web Application Documentation & Step-by-Step Learning Guide

Welcome to the web app documentation for the **AI-Controlled To-Do Platform**. This document is written in beginner-friendly language to guide you through the frontend architecture, design system, and step-by-step implementation.

---

## 1. 📁 Target File Structure

Below is the planned target structure for the React web frontend (`web/`):

```text
d:\Coding\Projects\todo\web/
├── public/                       # Static public assets (icons, favicon, etc.)
│   └── favicon.svg               # Cobalt blue checkmark application icon
├── src/                          # Application source code
│   ├── components/               # Reusable UI pieces
│   │   ├── layout/               # Header, Sidebar
│   │   ├── tasks/                # TaskItem, TaskList, AddTaskModal
│   │   ├── projects/             # CreateProjectModal
│   │   └── agent/                # AICopilotDrawer, CommandPalette
│   ├── context/                  # Global state management (TaskContext, ProjectContext, AgentContext)
│   ├── services/                 # API connection to FastAPI backend
│   │   └── api.js                # Fetch helper functions (GET /tasks, POST /tasks, etc.)
│   ├── index.css                 # Obsidian & Dark Cobalt color tokens and custom styles
│   ├── App.jsx                   # Main React page displaying sidebar and views
│   └── main.jsx                  # React application entry point
├── index.html                    # Root HTML file with Inter typography
├── package.json                  # Node.js dependencies (React, Lucide icons, Tailwind, Vite)
├── postcss.config.js             # PostCSS configuration for Tailwind
├── tailwind.config.js            # Tailwind CSS styling configuration
├── vite.config.js                # Vite build and development server configuration
└── documentation.md              # This living documentation guide
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

| Step | Focus Area | Description | Status |
| :--- | :--- | :--- | :--- |
| **Step 1** | Scaffolding & Design System | Vite + React 18 + Tailwind + Obsidian/Cobalt Theme | 🟢 Completed |
| **Step 2** | API Client Service Layer | Connect frontend to FastAPI backend endpoints | ⏳ Pending |
| **Step 3** | Global State Contexts | TaskContext, ProjectContext, AgentContext | ⏳ Pending |
| **Step 4** | Navigation & Layout Shell | Minimalist Sidebar, Header & Search | ⏳ Pending |
| **Step 5** | Task & Project Management Views | TaskList, TaskItem, AddTask & Project Modals | ⏳ Pending |
| **Step 6** | AI Copilot & Command Palette | Ctrl+K Command Bar & Groq Chat Drawer | ⏳ Pending |
| **Step 7** | Production Build & Verification | Verification testing and full build audit | ⏳ Pending |

---

## 4. 📝 Progress Log: Step-by-Step Breakdown

### 🟢 Step 1: Vite + React Scaffolding & Theme Engine (COMPLETED)

#### A. What was done:
1. Initialized the web application package configuration (`package.json`) targeting React 18, Vite 6, Tailwind CSS 3.4, and Lucide React icons.
2. Created `vite.config.js` with `@vitejs/plugin-react` and local port configuration on port `5173`.
3. Created `tailwind.config.js` and `postcss.config.js` configuring our custom color system:
   - **Obsidian** dark shades: `#030508`, `#060810`, `#0a0d16`, `#0e1320`, `#141b2d`.
   - **Cobalt** shades: `#001a3d`, `#002d62`, `#0047ab`, `#1d4ed8`, `#3b82f6`.
   - Custom box-shadow glows: `shadow-glow-cobalt` and `shadow-glow-subtle`.
4. Created `index.html` with Google Font pre-connects for Inter font, dark background class, and responsive viewport configuration.
5. Created `src/index.css` defining base theme styles, custom sleek scrollbars, and keyframe glow pulse animations.
6. Created `public/favicon.svg` with our signature Cobalt Blue checkmark icon.
7. Created the root entry point `src/main.jsx` mounting React into the DOM root element.
8. Installed all dependencies via `npm install`.

#### B. How it was done (commands & code explanation):
1. **Dependency Configuration (`package.json`)**:
   We added:
   - `react` & `react-dom` (`^18.3.1`): Industry-standard UI library.
   - `lucide-react` (`^0.475.0`): Clean, minimalist SVG icons.
   - `tailwindcss` (`^3.4.17`): Utility-first styling framework.
   - `clsx` & `tailwind-merge`: For combining and conditionally applying Tailwind classes cleanly.
   - `vite` (`^6.1.0`): Next-generation ultra-fast frontend build tool.

2. **Tailwind Color Palette Configuration (`tailwind.config.js`)**:
   We extended Tailwind's theme with custom obsidian and cobalt scales to match our dark futuristic aesthetic.

3. **Dependency Installation**:
   ```powershell
   cd d:\Coding\Projects\todo\web
   npm install
   ```

#### C. Why it was done:
Setting up a robust foundation with Vite and Tailwind ensures lightning-fast hot module replacement (HMR), zero CSS runtime bloat, and consistent design tokens across all components.

---

## 5. 🚀 How to Run the Backend and Frontend

### 1. Running the FastAPI Backend
> [!IMPORTANT]
> The backend entrypoint is located at `backend/main.py` directly, so the Uvicorn module path is `main:app` (NOT `app.main:app`).
```powershell
cd d:\Coding\Projects\todo\backend
.\.venv\Scripts\uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 2. Running the Web Frontend (Step 1 Scaffold)
```powershell
cd d:\Coding\Projects\todo\web
npm run dev
```
- Web Application: `http://localhost:5173`
