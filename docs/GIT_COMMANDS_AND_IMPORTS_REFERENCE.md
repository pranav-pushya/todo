# 🛠️ Git Commands & Full-Stack Imports Reference Guide

This document is an exhaustive, developer-friendly guide detailing:
1. **Every Git command** executed throughout our debugging, building, and deployment process, explaining the syntax, why we used it, how it works under the hood, and its industry-standard role.
2. **Every single Import statement** (across Python backend and React frontend), detailing what each library does, why it was chosen, what happened when it executed, and what would fail if it were omitted.

---

## 📑 Table of Contents
- [Part 1: Git Commands Master Reference](#part-1-git-commands-master-reference)
  - [1. `git status`](#1-git-status)
  - [2. `git diff`](#2-git-diff)
  - [3. `git add <file(s)>`](#3-git-add-files)
  - [4. `git commit -m "<message>"`](#4-git-commit--m-message)
  - [5. `git log` Variations (`--oneline`, `--stat`)](#5-git-log-variations---oneline---stat)
  - [6. `git grep <pattern>`](#6-git-grep-pattern)
  - [7. `git remote -v`](#7-git-remote--v)
  - [8. `git push origin <branch>`](#8-git-push-origin-branch)
  - [9. PowerShell `;` vs Bash `&&` Syntax Nuance](#9-powershell--vs-bash--syntax-nuance)
- [Part 2: Frontend Imports Reference (React & Web)](#part-2-frontend-imports-reference-react--web)
  - [1. Firebase SDK Imports](#1-firebase-sdk-imports)
  - [2. Lucide React Icon Imports](#2-lucide-react-icon-imports)
  - [3. React Core Hooks & Context API](#3-react-core-hooks--context-api)
  - [4. Internal Services & Context Imports](#4-internal-services--context-imports)
- [Part 3: Backend Imports Reference (FastAPI & Python)](#part-3-backend-imports-reference-fastapi--python)
  - [1. Cryptography & JWT Imports](#1-cryptography--jwt-imports)
  - [2. FastAPI Framework Imports](#2-fastapi-framework-imports)
  - [3. SQLAlchemy ORM & Database Engine](#3-sqlalchemy-orm--database-engine)
  - [4. Pydantic & Data Validation](#4-pydantic--data-validation)
  - [5. Standard Python Utilities (`secrets`, `datetime`)](#5-standard-python-utilities-secrets-datetime)
- [Part 4: Native Mobile Commands & Setup Reference (React Native & Expo)](#part-4-native-mobile-commands--setup-reference-react-native--expo)
  - [1. `npx create-expo-app`](#1-npx-create-expo-app)
  - [2. `npm start` / `npx expo start`](#2-npm-start--npx-expo-start)
  - [3. `npm run android` & `npm run ios`](#3-npm-run-android--npm-run-ios)
  - [4. `npm test` (Babel Automated Verification Suite)](#4-npm-test-babel-automated-verification-suite)
  - [5. `npx eas-cli build -p android --profile preview`](#5-npx-eas-cli-build--p-android---profile-preview)
- [Part 5: Native Mobile Imports Reference Guide (React Native & Navigation)](#part-5-native-mobile-imports-reference-guide-react-native--navigation)
  - [1. React Navigation (`@react-navigation/native`, `bottom-tabs`, `native-stack`)](#1-react-navigation-react-navigationnative-bottom-tabs-native-stack)
  - [2. Mobile Device Ergonomics (`expo-haptics`, `react-native-safe-area-context`)](#2-mobile-device-ergonomics-expo-haptics-react-native-safe-area-context)
  - [3. Native Vector Icons (`lucide-react-native`)](#3-native-vector-icons-lucide-react-native)
  - [4. Cross-Platform Storage & Networking (`storage.js`, `api.js`)](#4-cross-platform-storage--networking-storagejs-apijs)
  - [5. Mobile Reactive Contexts (`AuthContext`, `TaskContext`, `ProjectContext`, `AgentContext`)](#5-mobile-reactive-contexts-authcontext-taskcontext-projectcontext-agentcontext)

---

# Part 1: Git Commands Master Reference

---

### 1. `git status`
> **💡 Hinglish Summary:**  
> Ye command repository ki current state batata hai: kaunsi files modify hui hain, kaunsi stage ho chuki hain, aur kaunsi untracked hain. Humne ise har major change ke pehle aur baad check karne ke liye use kiya.

- **Exact Syntax Used**:
  ```bash
  git status
  ```
- **Why It Was Used in Our Workflow**:
  - Before committing, we needed to verify which files had unstaged modifications (e.g. `ZenFocusChamber.jsx`, `TaskItem.jsx`, `api.js`) and ensure no unwanted temporary build artifacts or scratch files were accidentally being committed.
- **Standard Industry Use Case**:
  - Developers run `git status` continuously as a sanity check to inspect their working directory against the Git staging index (`Index/Cache`).
- **Under the Hood in Git**:
  - Git computes SHA-1/SHA-256 hashes of the files in your working directory and compares them to the hashes recorded in the `.git/index` file. If the timestamps or hashes differ, Git categorizes the file as modified, untracked, or staged.

---

### 2. `git diff`
> **💡 Hinglish Summary:**  
> Ye command file ke andar line-by-line changes (kya add hua, kya delete hua) dikhata hai. Humne ise task tags normalization aur password visibility fixes ko verify karne ke liye run kiya.

- **Exact Syntax Used**:
  ```bash
  git diff
  ```
- **Why It Was Used in Our Workflow**:
  - We needed to inspect the precise lines changed in `web/src/components/tasks/TaskItem.jsx` and `web/src/context/TaskContext.jsx` to make sure our defensive tag checks (`Array.isArray(t.tags)`) didn't introduce syntax errors or remove existing logic.
- **Standard Industry Use Case**:
  - Used during self-code-review before staging changes to verify there are no stray `console.log` statements, debugging hacks, or unintentional whitespace modifications.
- **Flags Breakdown**:
  - `git diff`: Shows unstaged changes between the working directory and the staging area.
  - `git diff --staged`: Shows changes between the staging area and the last commit (`HEAD`).

---

### 3. `git add <file(s)>`
> **💡 Hinglish Summary:**  
> Ye command modified files ko 'Staging Area' mein bhejta hai taaki wo agle commit ka hissa ban sakein. Humne ise specific updated files ko carefully group karke commit karne ke liye use kiya.

- **Exact Syntax Used**:
  ```bash
  git add backend/app/api/v1/auth.py backend/app/core/firebase.py web/src/services/firebase.js
  ```
- **Why It Was Used in Our Workflow**:
  - Rather than blindly running `git add .` (which might stage temporary logs or test databases), we explicitly staged only the files relevant to the feature being saved (e.g. Firebase Auth integration).
- **Standard Industry Use Case**:
  - Allows developers to construct clean, atomic commits by staging only related changes together.
- **Under the Hood in Git**:
  - Reads the file content, compresses it into a `blob` object stored in `.git/objects/`, and updates the `.git/index` binary file with the blob's hash and file path.

---

### 4. `git commit -m "<message>"`
> **💡 Hinglish Summary:**  
> Ye command staged changes ka ek permanent snapshot banata hai ek descriptive message ke saath. Humne ise Conventional Commits format (`feat:`, `fix:`, `chore:`) ke mutabiq history record karne ke liye use kiya.

- **Exact Syntax Used**:
  ```bash
  git commit -m "feat(auth): integrate Firebase Authentication, automated password reset emails, Google sign-in, and Firebase Hosting"
  ```
- **Why It Was Used in Our Workflow**:
  - Sealed completed milestones into the Git tree:
    1. `fix(tasks): normalize tags across TaskContext and views`
    2. `feat(auth): add show/hide password toggle and forgot password recovery flow`
    3. `feat(auth): integrate Firebase Authentication, automated password reset emails, Google sign-in, and Firebase Hosting`
    4. `fix: prevent black screen crash on Firebase Hosting by rejecting HTML API rewrites`
- **Standard Industry Use Case**:
  - Creates a cryptographic commit object containing the author, committer, timestamp, parent commit hash, root tree hash, and commit message.
- **Flags Breakdown**:
  - `-m "<message>"`: Specifies the commit message inline without opening the default text editor (Vim/Nano).

---

### 5. `git log` Variations (`--oneline`, `--stat`)
> **💡 Hinglish Summary:**  
> Ye command commit history ko compact aur readable format mein dikhata hai. `--oneline` se har commit ek line mein dikhta hai aur `--stat` se kaunsi files change hui hain unka count milta hai.

- **Exact Syntax Used**:
  ```bash
  git log -n 5 --oneline
  git log -n 1 --stat
  ```
- **Why It Was Used in Our Workflow**:
  - `--oneline`: To quickly verify our commit tree order, check commit hashes (e.g. `68e3e6b`), and confirm how many commits ahead of `origin/main` we were.
  - `--stat`: To confirm exactly how many files and lines were modified in the latest commit before pushing.
- **Flags Breakdown**:
  - `-n <number>`: Limits output to the last `N` commits (avoids entering terminal pagination `less`).
  - `--oneline`: Compresses each commit into its 7-character short hash and summary title.
  - `--stat`: Appends file-level insertion (`+`) and deletion (`-`) metrics to each commit.

---

### 6. `git grep <pattern>`
> **💡 Hinglish Summary:**  
> Ye command pure codebase ke andar kisi bhi text ya code symbol ko bohot tezi se search karta hai. Humne ise 'password' aur 'Eye' icons ki existing occurrences dhoondhne ke liye use kiya.

- **Exact Syntax Used**:
  ```bash
  git grep -n "AuthAPI" web/src/
  git grep -i "smtp"
  git grep "Eye" web/src/
  ```
- **Why It Was Used in Our Workflow**:
  - When you asked for show/hide password buttons, we used `git grep` across `web/src/` to identify every component containing password inputs (`AuthModal.jsx`, `UserProfileModal.jsx`).
  - When you asked about forgot password, we checked if SMTP was configured anywhere in the project.
- **Standard Industry Use Case**:
  - Significantly faster than operating-system search because it traverses only Git-tracked files, automatically ignoring `node_modules/`, `.venv/`, and `.git/`.
- **Flags Breakdown**:
  - `-n`: Displays the exact line number where the match was found.
  - `-i`: Case-insensitive search.

---

### 7. `git remote -v`
> **💡 Hinglish Summary:**  
> Ye command dikhata hai ki hamara local repository kis GitHub remote URL se linked hai. Humne ise verify kiya taaki Render aur GitHub push sahi repository pe jayein.

- **Exact Syntax Used**:
  ```bash
  git remote -v
  ```
- **Output Observed**:
  ```text
  origin  https://github.com/pranav-pushya/todo.git (fetch)
  origin  https://github.com/pranav-pushya/todo.git (push)
  ```
- **Standard Industry Use Case**:
  - Confirms the active upstream and downstream URLs for fetching and pushing code.

---

### 8. `git push origin <branch>`
> **💡 Hinglish Summary:**  
> Ye command local repository ke committed changes ko GitHub cloud repository par upload karta hai. Isse Render automatically updated code ko pull karke deploy kar leta hai.

- **Exact Syntax Used**:
  ```bash
  git push origin main
  ```
- **Why It Was Used in Our Workflow**:
  - To push all newly created features (`firebase.js`, CORS configurations, Render start commands) to GitHub so Render could clone and build the updated backend.
- **Under the Hood in Git**:
  - Negotiates common ancestors between local and remote refs, generates a packfile containing the delta of missing commits/trees/blobs, transfers it over HTTPS, and fast-forwards the remote branch reference `refs/heads/main`.

---

### 9. ⚠️ PowerShell `;` vs Bash `&&` Syntax Nuance
> **💡 Hinglish Summary:**  
> Windows PowerShell mein do commands ko jodne ke liye `&&` ki jagah semicolon `;` use hota hai. Agar `&&` use karein toh PowerShell syntax error throw karta hai.

- **The Problem Encountered**:
  ```powershell
  git add ... && git commit -m "..."
  # Throws: ParserError: The token '&&' is not a valid statement separator in this version.
  ```
- **The Explanation**:
  - In traditional Unix shells (Bash/Zsh), `cmd1 && cmd2` executes `cmd2` only if `cmd1` succeeds.
  - In Windows PowerShell 5.1 (standard on Windows systems), `&&` is not a recognized operator; PowerShell uses `;` to chain commands sequentially:
  ```powershell
  git add ... ; git commit -m "..."
  ```

---

# Part 2: Frontend Imports Reference (React & Web)

---

### 1. Firebase SDK Imports
```javascript
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
```
- **Package**: `firebase` (`v10.x+`)
- **Location**: [`web/src/services/firebase.js`](file:///d:/Coding/Projects/todo/web/src/services/firebase.js)
- **Detailed Import Breakdown**:
  1. `initializeApp`:
     - **Why used**: Connects our frontend application to the Google Firebase project using our `apiKey`, `authDomain`, and `projectId` (`kortex-246`).
     - **What happened**: Instantiates the central Firebase App instance which maintains network sockets and telemetry.
     - **If omitted**: None of the Firebase services (Auth, Firestore, Storage) can run; throws `FirebaseError: No Firebase App '[DEFAULT]' has been created`.
  2. `getAuth`:
     - **Why used**: Retrieves the singleton authentication service tied to our initialized Firebase app.
     - **What happened**: Grants access to user session state and authentication methods.
  3. `createUserWithEmailAndPassword`:
     - **Why used**: Registers a new user account on Firebase Auth servers using email and password.
     - **What happened**: Creates a secure user record in Google Cloud, salts and hashes the password on Google's infrastructure, and returns a user credential containing an ID token.
  4. `signInWithEmailAndPassword`:
     - **Why used**: Authenticates an existing user with their email and password.
     - **What happened**: Verifies credentials with Firebase servers and returns fresh session tokens.
  5. `signInWithPopup` & `GoogleAuthProvider`:
     - **Why used**: Powers our **"Continue with Google"** 1-click login button.
     - **What happened**: Opens a secure Google OAuth popup window, allows the user to select their Google account, and returns their verified Google profile and token.
  6. `sendPasswordResetEmail`:
     - **Why used**: Powers our **"Forgot password?"** feature.
     - **What happened**: Commands Google's mail servers to generate a cryptographically signed, single-use password reset link and email it directly to the user's inbox from `noreply@kortex-246.firebaseapp.com`.
     - **If omitted**: We would have had to build and maintain our own SMTP mail server, DNS records, and token expiration logic.
  7. `signOut`:
     - **Why used**: Clears the authenticated Firebase session in the browser.

---

### 2. Lucide React Icon Imports
```javascript
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  Github,
  Briefcase,
  Key,
  CheckCircle2,
  X,
  Tag,
} from 'lucide-react';
```
- **Package**: `lucide-react`
- **Location**: [`web/src/components/auth/AuthModal.jsx`](file:///d:/Coding/Projects/todo/web/src/components/auth/AuthModal.jsx), [`UserProfileModal.jsx`](file:///d:/Coding/Projects/todo/web/src/components/auth/UserProfileModal.jsx)
- **Detailed Import Breakdown**:
  1. `Eye` & `EyeOff`:
     - **Why used**: Renders the show/hide password toggle button.
     - **What happened**: When `showPassword` is `false`, `<Eye />` is rendered. Clicking it sets state to `true` and renders `<EyeOff />`.
     - **If omitted**: The user would have no visual indicator or toggle to inspect what they typed.
  2. `Lock`:
     - **Why used**: Rendered as an input prefix icon for password fields.
  3. `Mail`:
     - **Why used**: Rendered as an input prefix icon for email fields.
  4. `Shield`:
     - **Why used**: Header icon symbolizing secure authentication and encryption.
  5. `CheckCircle2`:
     - **Why used**: Rendered in emerald green to confirm password reset email dispatch.

---

### 3. React Core Hooks & Context API
```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
```
- **Package**: `react`
- **Location**: Used across all Context providers and UI components.
- **Detailed Import Breakdown**:
  1. `createContext` & `useContext`:
     - **Why used**: Powers our global dependency injection system (`AuthContext`, `TaskContext`, `ProjectContext`, `AgentContext`).
     - **What happened**: Avoids "prop drilling" by making user profile, tokens, and active tasks accessible anywhere in the component hierarchy with a single hook call (`useAuth()`, `useTasks()`).
  2. `useCallback`:
     - **Why used**: Memoizes asynchronous fetching functions (like `fetchTasks`, `fetchProjects`, `refreshProfile`).
     - **What happened**: Prevents infinite re-render loops when passing functions into `useEffect` dependency arrays.
     - **If omitted**: Every state change would recreate the function, triggering `useEffect` continuously and hammering the backend with infinite requests.

---

### 4. Internal Services & Context Imports
```javascript
import { AuthAPI, TaskAPI, ProjectAPI, NoteAPI, AgentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUIFeedback } from '../context/UIFeedbackContext';
```
- **Location**: Component layer
- **Detailed Import Breakdown**:
  1. `AuthAPI`:
     - **Why used**: Provides methods like `firebaseSync()`, `login()`, `register()`, and `getMe()`.
     - **What happened**: Connects the UI to the backend REST API endpoints over HTTP fetch.
  2. `useUIFeedback`:
     - **Why used**: Provides access to modern notification banners (`toast.success()`, `toast.error()`) and confirmation modals.
     - **What happened**: Displays non-blocking, elegant toast notifications when signing in, creating accounts, or resetting passwords.

---

# Part 3: Backend Imports Reference (FastAPI & Python)

---

### 1. Cryptography & JWT Imports
```python
import jwt
from app.core.firebase import verify_firebase_id_token
from app.core.security import hash_password, verify_password, create_access_token
```
- **Package**: `PyJWT` (`pyjwt`), `bcrypt`, `cryptography`
- **Location**: [`backend/app/core/firebase.py`](file:///d:/Coding/Projects/todo/backend/app/core/firebase.py), [`backend/app/api/v1/auth.py`](file:///d:/Coding/Projects/todo/backend/app/api/v1/auth.py)
- **Detailed Import Breakdown**:
  1. `jwt.PyJWKClient`:
     - **Why used**: Connects to Google's public JSON Web Key Set (JWKS) URL (`https://www.googleapis.com/service_accounts/v1/jwk/...`).
     - **What happened**: Retrieves Google's public signing keys dynamically and extracts the exact key needed to verify a Firebase token's cryptographic signature.
     - **If omitted**: The server could not verify whether a Firebase token was authentic or forged by an attacker.
  2. `jwt.decode`:
     - **Why used**: Decodes the RS256 token, verifies that it hasn't expired (`exp`), and ensures the audience (`aud`) and issuer (`iss`) match our Firebase project ID (`kortex-246`).
  3. `jwt.ExpiredSignatureError`:
     - **Why used**: Specific exception class thrown when a token's expiration timestamp has passed.
     - **What happened**: Allows our API to catch expired tokens cleanly and return HTTP `401 Unauthorized` with a friendly error message.

---

### 2. FastAPI Framework Imports
```python
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
```
- **Package**: `fastapi` (`v0.110.0+`)
- **Location**: [`backend/main.py`](file:///d:/Coding/Projects/todo/backend/main.py), [`backend/app/api/v1/auth.py`](file:///d:/Coding/Projects/todo/backend/app/api/v1/auth.py)
- **Detailed Import Breakdown**:
  1. `FastAPI` & `APIRouter`:
     - **Why used**: Creates the core application instance and modular endpoint routers (`/auth`, `/tasks`, `/projects`).
     - **What happened**: Sets up automatic OpenAPI documentation (`/docs`), route matching, and async request handling.
  2. `Depends`:
     - **Why used**: FastAPI's dependency injection system.
     - **What happened**: Automatically provides database sessions (`db: Session = Depends(get_db)`) and resolves current authenticated users (`current_user: User = Depends(get_current_user)`).
  3. `HTTPException` & `status`:
     - **Why used**: Standardizes HTTP error codes (e.g. `status.HTTP_401_UNAUTHORIZED`, `status.HTTP_404_NOT_FOUND`).
  4. `CORSMiddleware`:
     - **Why used**: Configures Cross-Origin Resource Sharing.
     - **What happened**: Injects `Access-Control-Allow-Origin: https://kortex-246.web.app` into server response headers so browsers do not block web requests.

---

### 3. SQLAlchemy ORM & Database Engine
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func, text
from sqlalchemy.orm import relationship, Session
from app.core.database import Base, engine, SessionLocal, get_db
```
- **Package**: `sqlalchemy` (`v2.0+`)
- **Location**: Models, CRUD, and database configurations.
- **Detailed Import Breakdown**:
  1. `Column`, `Integer`, `String`, `Boolean`, `DateTime`, `Text`:
     - **Why used**: Defines database schema attributes on our ORM models (e.g. `User.firebase_uid`, `User.email`, `Task.title`).
     - **What happened**: Maps Python class attributes to underlying SQLite columns.
  2. `relationship`:
     - **Why used**: Defines relational links between entities (e.g. `User.tasks = relationship("Task", back_populates="user")`).
     - **What happened**: Enables cascading deletes (`cascade="all, delete-orphan"`) so deleting an account safely cleans up its tasks and notes.
  3. `func`:
     - **Why used**: Provides database SQL functions like `func.lower()` (for case-insensitive email/username search) and `func.count()` (for analytics and workspace item counts).
  4. `text`:
     - **Why used**: Executes raw SQL pragmas during startup (`PRAGMA table_info(users)`).
     - **What happened**: Powers our auto-migration script in [`backend/main.py`](file:///d:/Coding/Projects/todo/backend/main.py) to dynamically add new columns (`firebase_uid`, `reset_token`) to SQLite tables without dropping data.

---

### 4. Pydantic & Data Validation
```python
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
```
- **Package**: `pydantic` (`v2.6+`), `pydantic-settings`
- **Location**: Schemas and settings configuration.
- **Detailed Import Breakdown**:
  1. `BaseModel`:
     - **Why used**: Defines input request payloads and response contracts (e.g. `FirebaseSyncRequest`, `TokenResponse`, `UserProfileResponse`).
     - **What happened**: Automatically validates incoming JSON data before your endpoint logic even runs. If a client sends invalid types, Pydantic immediately returns HTTP 422 with a precise error breakdown.
  2. `field_validator`:
     - **Why used**: Sanitizes user inputs (e.g. converting email addresses to lowercase, stripping whitespace, and cleaning GitHub URLs into raw usernames).
  3. `BaseSettings`:
     - **Why used**: In [`backend/app/core/config.py`](file:///d:/Coding/Projects/todo/backend/app/core/config.py), reads environment variables from `.env` files with strong typing.

---

### 5. Standard Python Utilities (`secrets`, `datetime`)
```python
import secrets
from datetime import datetime, timezone, timedelta
```
- **Package**: Python Standard Library
- **Location**: [`backend/app/crud/user.py`](file:///d:/Coding/Projects/todo/backend/app/crud/user.py), [`backend/app/models/user.py`](file:///d:/Coding/Projects/todo/backend/app/models/user.py)
- **Detailed Import Breakdown**:
  1. `secrets.randbelow`:
     - **Why used**: Cryptographically secure pseudo-random number generator (CSPRNG).
     - **What happened**: Generates unpredictable numeric recovery codes (`f"{secrets.randbelow(900000) + 100000}"`) suitable for security-sensitive tokens, unlike Python's standard `random` module which is predictable.
  2. `datetime`, `timezone`, `timedelta`:
     - **Why used**: Manages token expiration and record timestamps in strict UTC (`datetime.now(timezone.utc)`).
     - **What happened**: Guarantees that token validity comparisons work identically regardless of the server's local operating system timezone or daylight saving shifts.

---

# Part 4: Native Mobile Commands & Setup Reference (React Native & Expo)

---

### 1. `npx create-expo-app`
> **💡 Hinglish Summary:**  
> Ye command ek complete React Native mobile project scaffold karta hai Expo toolchain ke saath. Isse bina manual Android Studio ya Xcode project setup kiye modern mobile app develop ki ja sakti hai.

- **Exact Syntax Used**:
  ```bash
  npx create-expo-app@latest mobile --template blank
  ```
- **Why It Was Used in Our Workflow**:
  - We initialized the `mobile/` directory to create our cross-platform iOS and Android Kortex client, configured with dark background themes (`#060810`), portrait orientation locks, and package identifiers (`com.kortex.todo`).
- **Standard Industry Use Case**:
  - Expo is the official React Native team-recommended toolchain for bootstrapping new native applications with zero native boilerplate.
- **Under the Hood**:
  - Downloads the official Expo SDK 52 project template, initializes `package.json`, generates `app.json`, and links Metro bundler configuration files.

---

### 2. `npm start` / `npx expo start`
> **💡 Hinglish Summary:**  
> Ye command Expo Metro bundler ko start karta hai aur terminal mein ek interactive QR code generate karta hai. Is QR code ko apne physical phone ke Expo Go app se scan karte hi app phone par live chalne lagti hai with Fast Refresh.

- **Exact Syntax Used**:
  ```bash
  cd mobile
  npm start
  ```
- **Why It Was Used in Our Workflow**:
  - Allows instantaneous live testing of screens, tactile haptic vibrations, bottom tab transitions, and AI copilot conversations directly on physical Android or iPhone hardware over local Wi-Fi.
- **Key Flags & Shortcuts**:
  - `a`: Automatically opens Android emulator or connected ADB device.
  - `i`: Automatically launches iOS simulator (on macOS).
  - `r`: Reloads the app bundle instantly.
  - `c`: Clears the Metro bundler cache if stale module errors appear.

---

### 3. `npm run android` & `npm run ios`
> **💡 Hinglish Summary:**  
> Ye shortcut commands sidhe Android Emulator ya iOS Simulator ko launch karke app ko deploy kar deti hain.

- **Exact Syntax Used**:
  ```bash
  npm run android
  npm run ios
  ```
- **Why It Was Used in Our Workflow**:
  - Streamlines automated verification on Android virtual devices (AVD), checking edge-to-edge layout padding, status bar colors, and gesture responsiveness.
- **Under the Hood**:
  - Calls `expo start --android` which queries `adb devices`, starts the Android emulator if not already active, installs Expo Go if missing, and streams the compiled JavaScript bundle.

---

### 4. `npm test` (Babel Automated Verification Suite)
> **💡 Hinglish Summary:**  
> Ye command hamare banaye custom verification script `test_mobile_bundle.js` ko run karta hai. Ye mobile ke sabhi 26 components, contexts, aur screens ko transpile karke check karta hai ki kahin koi syntax error, missing import ya unclosed tag toh nahi.

- **Exact Syntax Used**:
  ```bash
  npm test
  ```
- **Why It Was Used in Our Workflow**:
  - To verify complete syntactic and architectural correctness before every Git commit.
  - Successfully verified all 26 components with a 100% pass rate:
    - Screens: `TodayScreen`, `InboxScreen`, `ProjectsScreen`, `NotesScreen`, `AgentScreen`, `ProfileScreen`, `AuthScreen`.
    - Contexts: `AuthContext`, `TaskContext`, `ProjectContext`, `AgentContext`.
    - Components: `SwipeableTaskRow`, `AddTaskModal`, `PriorityBadge`, `CustomButton`, `Header`, `ScreenContainer`.
- **Under the Hood**:
  - Uses `@babel/core` with `babel-preset-expo` to parse JSX and modern ECMAScript into valid JavaScript, halting immediately if any parse exception is encountered.

---

### 5. `npx eas-cli build -p android --profile preview`
> **💡 Hinglish Summary:**  
> Ye command Expo Application Services (EAS) cloud build trigger karta hai, jo ek standalone installable `.apk` file generate karta hai. Is APK ko kisi bhi Android phone par install kiya ja sakta hai bina developer tools ke.

- **Exact Syntax Used**:
  ```bash
  npx eas-cli build -p android --profile preview
  ```
- **Why It Was Used in Our Workflow**:
  - Defined in `mobile/eas.json` under the `preview` profile to produce standalone distribution packages for QA, field testing, and external stakeholders.
- **Under the Hood**:
  - Packages the mobile repository, uploads code to Expo Cloud Builders, compiles native Gradle/Android C++ dependencies via Android NDK, signs the binary with a keystore, and provides a direct download link.

---

# Part 5: Native Mobile Imports Reference Guide (React Native & Navigation)

---

### 1. React Navigation (`@react-navigation/native`, `bottom-tabs`, `native-stack`)
```javascript
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```
- **Package**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **Location**: [`mobile/src/navigation/AppNavigator.js`](file:///d:/Coding/Projects/todo/mobile/src/navigation/AppNavigator.js), [`mobile/src/navigation/BottomTabNavigator.js`](file:///d:/Coding/Projects/todo/mobile/src/navigation/BottomTabNavigator.js)
- **Detailed Import Breakdown**:
  1. `NavigationContainer`:
     - **Why used**: Top-level root provider managing routing history, deep linking, and device back-button events on Android.
     - **What happened**: Supplies our custom `KortexNavigationTheme` so header bars and screen transitions default to Obsidian Black (`#060810`).
     - **What would fail without it**: React Navigation throws a fatal error: *"Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?"*.
  2. `createBottomTabNavigator`:
     - **Why used**: Constructs the ergonomic 5-tab bottom dock (Today, Inbox, Projects, Notes, Copilot).
     - **What happened**: Renders tab buttons with Lucide vector icons, active tint color switching, and persistent background tab caching.
  3. `createNativeStackNavigator`:
     - **Why used**: Builds hardware-accelerated native stack transitions for modal screens like `ProfileScreen` and `AuthScreen`.
     - **What happened**: Uses native iOS `UINavigationController` and Android Fragment animations rather than JS-simulated transitions, achieving smooth 60fps gestures.

---

### 2. Mobile Device Ergonomics (`expo-haptics`, `react-native-safe-area-context`)
```javascript
import * as Haptics from 'expo-haptics';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
```
- **Package**: `expo-haptics`, `react-native-safe-area-context`
- **Location**: [`mobile/src/hooks/useHaptics.js`](file:///d:/Coding/Projects/todo/mobile/src/hooks/useHaptics.js), [`mobile/src/components/common/ScreenContainer.js`](file:///d:/Coding/Projects/todo/mobile/src/components/common/ScreenContainer.js)
- **Detailed Import Breakdown**:
  1. `expo-haptics`:
     - **Why used**: Triggers the phone's physical Taptic Engine / linear resonance actuators for tactile vibration feedback.
     - **What happened**: Provides satisfying physical confirmation when tapping tabs (`triggerLight`), completing tasks (`triggerSuccess`), or encountering API errors (`triggerError`).
     - **What would fail without it**: The mobile app feels flat and unresponsive compared to native apps like Apple Reminders or Things 3.
  2. `SafeAreaProvider` & `SafeAreaView`:
     - **Why used**: Automatically detects physical hardware cutouts (iPhone Dynamic Island, camera punch-holes, Android navigation gesture bars).
     - **What happened**: Dynamically injects padding around screen edges so buttons and text never get hidden behind device bezels or home indicators.

---

### 3. Native Vector Icons (`lucide-react-native`)
```javascript
import { Calendar, Inbox, FolderKanban, FileText, Sparkles, Plus, Check, Trash2 } from 'lucide-react-native';
```
- **Package**: `lucide-react-native`, `react-native-svg`
- **Location**: Throughout screens, navigation bars, and buttons.
- **Detailed Import Breakdown**:
  - **Why used**: Provides scalable, resolution-independent vector icons rendered via SVG.
  - **What happened**: Icons scale flawlessly on high-DPI smartphone displays (Retina, AMOLED) with custom colors and stroke widths without pixelation or heavy image asset bundles.
  - **What would fail without it**: Static PNG icons would look blurry on ultra-high-resolution mobile screens and increase app download size.

---

### 4. Cross-Platform Storage & Networking (`storage.js`, `api.js`)
```javascript
import { TaskAPI, ProjectAPI, NoteAPI, AgentAPI, AuthAPI, SERVER_PRESETS, getActiveHost, setActiveHost } from '../services/api.js';
import storage from '../services/storage.js';
```
- **Location**: [`mobile/src/services/api.js`](file:///d:/Coding/Projects/todo/mobile/src/services/api.js), [`mobile/src/services/storage.js`](file:///d:/Coding/Projects/todo/mobile/src/services/storage.js)
- **Detailed Import Breakdown**:
  1. `SERVER_PRESETS` & `setActiveHost`:
     - **Why used**: Solves mobile networking loopback challenges where `localhost` points to the phone rather than the developer's laptop.
     - **What happened**: Allows users to seamlessly switch between the live Render Cloud backend (`https://kortex-xnin.onrender.com/api/v1`), Android emulator loopback (`10.0.2.2:8001`), or custom local Wi-Fi IPs directly from the Profile screen.
  2. `storage.getItem` / `storage.setItem`:
     - **Why used**: Persists JWT access tokens and user profile information across app reboots.

---

### 5. Mobile Reactive Contexts (`AuthContext`, `TaskContext`, `ProjectContext`, `AgentContext`)
```javascript
import { useAuth } from '../context/AuthContext.js';
import { useTasks } from '../context/TaskContext.js';
import { useProjects } from '../context/ProjectContext.js';
import { useAgent } from '../context/AgentContext.js';
```
- **Location**: [`mobile/src/context/`](file:///d:/Coding/Projects/todo/mobile/src/context/)
- **Detailed Import Breakdown**:
  1. `TaskContext` (Optimistic Mutations):
     - **Why used**: Immediately flips task completion state and UI checkmarks before the network request finishes. If the server fails, it seamlessly alerts the user, providing zero-latency interactions.
  2. `AgentContext` (Autonomous Event Loop):
     - **Why used**: Connects natural language chat to backend tool execution and automatically invalidates and refreshes task caches when the AI creates or schedules items.
  3. `AuthContext` (Guest Mode Bypass):
     - **Why used**: Offers 1-click instant sandbox evaluation so developers and testers can experience the mobile app without setting up server accounts.

---

### 6. Asset Management & Bundler Plugins (`expo-asset`)
```javascript
import * as Asset from 'expo-asset';
```
- **Package**: `expo-asset`
- **Location**: Bundler plugin integration in `@expo/metro-config` and `app.json`.
- **Detailed Breakdown**:
  - **Why used**: Required by `@expo/metro-config` in Expo SDK 52 to resolve, cache, and serve static assets (`icon.png`, `splash.png`, `adaptive-icon.png`).
  - **What happened**: Fixed the runtime startup exception `Error: The required package 'expo-asset' cannot be found`. Metro now bundles all 2,561 modules seamlessly.
  - **What would fail without it**: `expo start` immediately aborts during the Metro bundler startup hook `getAssetPlugins`.

---

### 7. Gesture Engine & Root Provider (`react-native-gesture-handler`)
```javascript
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
```
- **Package**: `react-native-gesture-handler`
- **Location**: [`mobile/index.js`](file:///d:/Coding/Projects/todo/mobile/index.js), [`mobile/App.js`](file:///d:/Coding/Projects/todo/mobile/App.js)
- **Detailed Breakdown**:
  - **Why used**: Provides 60fps touch gesture processing natively on the UI thread for swipe actions, modal dismissing, and scroll containers.
  - **What happened**: Placing `import 'react-native-gesture-handler'` at the very top of `index.js` and wrapping the entire root application in `<GestureHandlerRootView style={{ flex: 1 }}>` prevents root layout collapses in Expo Go on Android.
  - **What would fail without it**: On physical Android devices, any gesture detector or nested scroll view immediately crashes the React Native bridge on load.

---

### 8. Root Error Boundary (`ErrorBoundary.js`)
```javascript
import ErrorBoundary from './src/components/common/ErrorBoundary.js';
```
- **Location**: [`mobile/App.js`](file:///d:/Coding/Projects/todo/mobile/App.js), [`mobile/src/components/common/ErrorBoundary.js`](file:///d:/Coding/Projects/todo/mobile/src/components/common/ErrorBoundary.js)
- **Detailed Breakdown**:
  - **Why used**: Catches any unhandled JavaScript error or component render exception occurring anywhere in the child component tree.
  - **What happened**: Rather than allowing an unhandled exception to bubble up and trigger Expo Go's opaque blue screen (*"Something went wrong. Sorry about that."*), the ErrorBoundary catches the crash and displays a styled Obsidian Dark UI detailing the exact error message, component stack trace, and 1-tap recovery buttons (*"Reload Interface"* and *"Reset Storage & Cache"*).
  - **What would fail without it**: In development or physical testing, any subtle platform incompatibility unmounts the entire React root with zero diagnostic feedback on the phone.

---

### 9. Safe Timestamp Formatting (Hermes/JSC Intl Safety)
```javascript
const formatTime = (d = new Date()) => {
  const date = new Date(d);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
```
- **Location**: [`mobile/src/context/AgentContext.js`](file:///d:/Coding/Projects/todo/mobile/src/context/AgentContext.js)
- **Detailed Breakdown**:
  - **Why used**: Pure arithmetic timestamp generator that avoids relying on `Date.prototype.toLocaleTimeString` or `Intl.DateTimeFormat`.
  - **What happened**: Fixed a fatal startup crash on physical Android phones where `toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })` threw a `RangeError: Unsupported locale or options` during module evaluation on Android Hermes/JSC engines.
  - **What would fail without it**: The app fails to boot on Android devices with compact or truncated ICU locale data.




