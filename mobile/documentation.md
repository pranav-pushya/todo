# Native Mobile App Documentation & Step-by-Step Learning Guide

Welcome to the native mobile app documentation for the **Kortex Platform**. This document is written in beginner-friendly language to guide you through the mobile architecture, Expo workflow, and native features.

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

## 3. 🗺️ Full Native Mobile App Implementation Plan (10-Step Roadmap)

| Step | Focus Area | Deliverables & Scope |
| :---: | :--- | :--- |
| **Step 1** | **Expo Project Scaffold & Dependencies** | Expo SDK 52 environment, app.json metadata, Babel config, root entrypoints |
| **Step 2** | **Design System & Theme Tokens** | Obsidian Dark OLED palette, Cobalt Blue accents, P1–P4 priority badges, native UI primitives |
| **Step 3** | **Network Service & Dynamic Host Resolver** | API client connecting to Localhost, Android loopback, and Render Cloud with JWT interceptors |
| **Step 4** | **Global State Contexts & Secure Storage** | AuthContext, TaskContext, ProjectContext, AgentContext with optimistic local updates |
| **Step 5** | **Navigation Infrastructure** | React Navigation AuthStack, 5-Tab Bottom Dock (Today, Inbox, Projects, Notes, Copilot), custom header |
| **Step 6** | **Native Task Management & Swipe Gestures** | 60fps FlatList, SwipeableTaskRow with haptic feedback, AddTask modal |
| **Step 7** | **Projects & Notes Mobile Screens** | Project folder cards with progress meters, dual-format Notes (.md / .txt) reader & checklist sync |
| **Step 8** | **AI Copilot Mobile Console** | Interactive AI chat, tool execution audit feed, quick prompts, and live state invalidation |
| **Step 9** | **Profile, Settings & Server Switching** | Developer profile, velocity analytics, dynamic backend server switcher (Local ↔ Render Cloud) |
| **Step 10** | **Polish, Multi-Platform Testing & Build Config** | Safe area handling, offline banner, EAS Build configuration (`eas.json`), verification report |

---

## 4. 📝 Progress Log: Step-by-Step Breakdown

| Step | Description | Status | Commit / Notes |
| :--- | :--- | :--- | :--- |
| **Step 1** | Expo React Native Project Scaffold | ✅ Completed | Initialized Expo SDK 52, `app.json`, `package.json`, `index.js`, `App.js` |
| **Step 2** | Design System & Theme Tokens | ✅ Completed | `colors.js`, `typography.js`, `ScreenContainer`, `CustomButton`, `PriorityBadge`, `Header`, `useHaptics` |
| **Step 3** | Network Service & Host Resolver | ⏳ Pending | `api.js` with Render Cloud & local fallback |
| **Step 4** | Global State Contexts & Storage | ⏳ Pending | Auth, Task, Project & Agent contexts |
| **Step 5** | Navigation Infrastructure | ⏳ Pending | Bottom Tabs & Stack navigation |
| **Step 6** | Native Task Lists & Swipe Gestures | ⏳ Pending | Swipeable rows + Haptics |
| **Step 7** | Projects & Notes Mobile Screens | ⏳ Pending | Project cards & Notes markdown reader |
| **Step 8** | AI Copilot Mobile Console | ⏳ Pending | Tool execution audit feed & chat |
| **Step 9** | Profile & Server Switcher | ⏳ Pending | Developer profile & dynamic host switch |
| **Step 10** | Polish & EAS Build Configuration | ⏳ Pending | Cross-platform verification & `eas.json` |

---

## 5. 🛠️ Step-by-Step Implementation Details

### Step 1: Expo Project Scaffold & Core Dependencies

#### 1. What Was Done
- Scaffolded the official Expo React Native environment inside `mobile/`.
- Configured application metadata in `app.json` for Android and iOS targeting bundle identifier `com.kortex.todo`.
- Configured Babel transformation in `babel.config.js` with `babel-preset-expo`.
- Defined runtime entrypoint in `index.js` using Expo's `registerRootComponent`.
- Created initial root component in `App.js` featuring the Kortex Obsidian Dark styling.
- Installed 920 required native packages across navigation, haptics, vector icons, SVG rendering, safe area contexts, and gesture handling.

#### 2. How It Was Done
- **`package.json`**: Configured compatible package versions:
  - `expo`: `~52.0.0`
  - `react`: `18.3.1` (aligned identically with the Kortex web frontend)
  - `react-native`: `0.76.6`
  - `@react-navigation/native` & `@react-navigation/bottom-tabs`: `^7.0.0`
  - `expo-haptics`: `~14.0.0` (tactile vibrations)
  - `lucide-react-native`: `^0.475.0` (futuristic vector icons)
  - `react-native-gesture-handler`: `~2.20.2` (smooth 60fps swipe gestures)
  - `react-native-safe-area-context`: `4.12.0` (edge-to-edge support for notches and home bars)
- **`app.json`**:
  ```json
  {
    "expo": {
      "name": "Kortex",
      "slug": "kortex",
      "version": "1.0.0",
      "orientation": "portrait",
      "userInterfaceStyle": "dark",
      "splash": {
        "backgroundColor": "#060810"
      },
      "android": {
        "package": "com.kortex.todo"
      },
      "ios": {
        "bundleIdentifier": "com.kortex.todo"
      }
    }
  }
  ```
- **Verification**: Executed `npm install --no-audit` with zero resolution conflicts.

#### 3. Why It Was Done
- **Cross-Platform Consistency**: Using React 18.3.1 allows maximum code/concept reuse between the React web app and React Native mobile app.
- **Expo Managed Workflow**: Avoids brittle manual Xcode/Android Studio native linking while supporting modern New Architecture (`newArchEnabled: true`) and OTA updates.
- **OLED First**: Initialized default black background (`#060810`) and light status bar right from the root configuration to prevent white-flash flicker on boot.

---

### Step 2: Design System, Theme Tokens & Native Primitives

#### 1. What Was Done
- Created central design system tokens in `src/theme/colors.js` matching Kortex's signature Obsidian Black, Pure White, and Cobalt Blue palette.
- Created typography tokens in `src/theme/typography.js` for consistent font sizes, weights, and line heights.
- Created reusable native UI primitives:
  - `src/components/common/ScreenContainer.js`: Safe area handling for Android navigation pills and iOS notches.
  - `src/components/common/PriorityBadge.js`: P1 (Urgent/Red), P2 (High/Orange), P3 (Medium/Blue), P4 (Low/Slate) chips.
  - `src/components/common/CustomButton.js`: Native pressable with cobalt blue states, loading spinners, and press opacity feedback.
  - `src/components/common/Header.js`: Persistent top branding bar with "⚡ Kortex" logo and action buttons.
  - `src/hooks/useHaptics.js`: Custom hook providing safe tactile feedback with try/catch fallbacks for physical devices and simulators.

#### 2. How It Was Done
- **`colors.js`**: Defined tokens including `background: '#060810'`, `surfaceCard: '#0e1320'`, `cobaltPrimary: '#1d4ed8'`, `cobaltLight: '#3b82f6'`, and priority status colors.
- **`ScreenContainer.js`**: Utilized `SafeAreaView` from `react-native-safe-area-context` and configured `<StatusBar barStyle="light-content" />`.
- **`useHaptics.js`**:
  ```javascript
  import * as Haptics from 'expo-haptics';

  export function useHaptics() {
    const triggerLight = async () => {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    };
    const triggerSuccess = async () => {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    };
    return { triggerLight, triggerSuccess };
  }
  ```
- **Verification**: Verified token loading via Node runtime (`node -e "require('./src/theme/colors'); ..."`) and rendered interactive preview in `App.js`.

#### 3. Why It Was Done
- **Brand Cohesion**: Guarantees the mobile user experiences the exact same visual identity and hierarchy established in the web app.
- **Battery Optimization**: Deep OLED blacks (`#060810`) turn off pixels on modern OLED/AMOLED smartphone displays, conserving battery life.
- **Device Independence**: Encapsulating safe area logic in `ScreenContainer` prevents content from clipping under camera punch holes, dynamic islands, or navigation bars.
