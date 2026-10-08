# Native Mobile App Documentation & Step-by-Step Learning Guide

Welcome to the native mobile app documentation for the **AI-Controlled To-Do Platform**. This document is written in beginner-friendly language to guide you through the mobile architecture, Expo workflow, and native features.

---

## 1. 📁 Target File Structure

Below is the planned target structure for the React Native (Expo) mobile app (`mobile/`):

```text
d:\Coding\Projects\todo\mobile/
├── assets/                       # App icons, splash screens, and native assets
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/                          # Mobile source code
│   ├── components/               # Native UI widgets
│   │   ├── common/               # Native buttons, inputs, modals
│   │   ├── tasks/                # NativeTaskItem, SwipeableTaskRow, PriorityBadge
│   │   ├── projects/             # ProjectChip, ProjectCard
│   │   └── agent/                # MobileAgentDrawer, MicButton, CommandInput
│   ├── context/                  # State management shared across mobile screens
│   ├── hooks/                    # Mobile-specific hooks (useHaptics, useTasks)
│   ├── screens/                  # App screens
│   │   ├── TodayScreen.js        # Daily agenda and urgent checklist
│   │   ├── InboxScreen.js        # Quick capture inbox
│   │   ├── ProjectsScreen.js     # Categorized project folders
│   │   └── AgentScreen.js        # Dedicated full-screen AI command center
│   ├── services/                 # API connection to FastAPI backend
│   │   └── api.js                # Mobile HTTP client (works on iOS, Android, and emulator)
│   ├── theme/                    # Theme tokens (Obsidian Black, Cobalt Blue, Pure White)
│   │   └── colors.js
│   └── navigation/               # Bottom Tab & Stack Navigation
│       └── AppNavigator.js
├── App.js                        # Root entry component with Theme and SafeAreaProvider
├── app.json                      # Expo application metadata (name, orientation, bundleId)
├── package.json                  # Node.js dependencies (React Native, Expo, Lucide icons)
└── documentation.md              # This living documentation guide
```

---

## 2. 📱 Native Mobile Features

- **Haptic Feedback**: Subtle vibration tick when marking a task complete.
- **Swipe Gestures**: Swipe right to complete a task, swipe left to delete or reschedule.
- **Dark Cobalt Aesthetic**: Sleek OLED-friendly black background with dark cobalt accents.
- **Direct Backend Sync**: Connects to the same FastAPI backend (`http://<local-ip>:8000/api/v1`) as the web app.
- **AI Agent Voice/Text Bar**: Instant floating button to dictate or type commands to the AI.

---

## 3. 🗺️ Full Native Mobile App Implementation Plan

### Step 1: Expo Scaffold & Dependencies
- Initialize an Expo React Native application inside `mobile/`.
- Install core native packages:
  - `@react-navigation/native` & `@react-navigation/bottom-tabs`: Native screen navigation.
  - `expo-haptics`: Tactile feedback on button presses and completions.
  - `lucide-react-native`: Sleek vector icons.
  - `expo-status-bar`: Styled mobile status bar.

### Step 2: Mobile API Client Service (`src/services/api.js`)
- Configure network client with dynamic backend host detection (connecting seamlessly to the development machine's local IP or emulator loopback).
- Provide CRUD functions for tasks, projects, and AI agent execution.

### Step 3: Minimalist Design Theme (`src/theme/colors.js`)
- Implement the identical Obsidian Black (`#060810`), Pure White (`#ffffff`), and Cobalt Blue (`#1d4ed8`) theme optimized for mobile touchscreens.

### Step 4: Bottom Tab Navigation (`src/navigation/`)
- Set up a clean bottom navigation bar:
  - 📅 **Today**: Focused daily checklist.
  - 📥 **Inbox**: Quick-capture thoughts and unassigned tasks.
  - 📁 **Projects**: Colored project groupings.
  - 🤖 **AI Copilot**: Direct AI command interface.

### Step 5: Native Task List & Gestures (`src/screens/TodayScreen.js`)
- Build smooth 60fps scrolling task lists with swipe-to-complete and priority indicators (`P1`-`P4`).
- Add quick floating action button (`+`) for instant task creation.

### Step 6: Mobile AI Agent Interface (`src/screens/AgentScreen.js`)
- Build a chat-style interface to give commands to the backend AI agent.
- Display cards showing the results (e.g., *"Created 3 tasks for Project Mobile"*).

### Step 7: Mobile Device Verification
- Verify running via Expo Go on physical iOS/Android device or emulator.
- Test real-time synchronization with the web app and FastAPI backend.

---

## 4. 📝 Progress Log: Step-by-Step Breakdown

*Status: Planned (Will begin after Phase 1 & 2 backend core are verified).*

| Step | Description | Status |
| :--- | :--- | :--- |
| **Step 1** | Expo React Native Project Scaffold | ⏳ Pending |
| **Step 2** | Mobile API Client & IP Config | ⏳ Pending |
| **Step 3** | Color Tokens & Theme System | ⏳ Pending |
| **Step 4** | Bottom Tab Navigation Setup | ⏳ Pending |
| **Step 5** | Native Task Lists & Haptics | ⏳ Pending |
| **Step 6** | AI Voice/Text Command Interface | ⏳ Pending |
| **Step 7** | Multi-Platform Device Verification | ⏳ Pending |

---

*This document will be updated as soon as mobile app development begins.*
