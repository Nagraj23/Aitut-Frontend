# AiTut

![Platform](https://img.shields.io/badge/Platform-React%20Native-blue)
![Framework](https://img.shields.io/badge/Framework-Expo-000000)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

AI-powered mobile learning companion for student onboarding, assessment, roadmap generation, and guided tutoring.

## Overview

AiTut is a role-aware mobile application built with React Native and Expo. It supports student learning workflows (profile completion, diagnostic assessments, roadmap generation, AI learning assistance) and a dedicated TPO workflow (branch and student management).

The app integrates with multiple backend services for authentication/profile, assessments/roadmaps, and AI tutoring/chat. On-device state is persisted with AsyncStorage to provide seamless session recovery and offline-friendly UI continuity.

## Problem Statement

Engineering students often struggle with fragmented preparation: no structured baseline assessment, no personalized roadmap, and limited continuous mentoring. AiTut addresses this by combining:

- academic profile-driven onboarding,
- progressive diagnostic testing,
- AI-generated learning roadmaps,
- conversational and guided AI tutoring,
- and institutional monitoring workflows for TPO stakeholders.

## Features

- 🔐 **Authentication Suite**: Register, login, OTP verification, forgot/reset password, role-based signup (`STUDENT`, `TEACHER`, `TPO`).
- 🧠 **AI Tutor Chat**: Contextual question-answer chat with user academic metadata and chat history.
- 🎓 **Guided Teach Sessions**: Day/topic-based teach flow with streamed responses, markdown rendering, copy, and text-to-speech.
- 🧪 **Diagnostic Assessments**: Multi-phase test generation and submission (MCQ + descriptive) with onboarding progression.
- 🗺️ **Roadmap Lifecycle**: Personalized roadmap generation and latest roadmap sync from backend.
- 🏫 **TPO Module**: Branch creation, student invitation, branch-wise student tracking, branch reports, and TPO profile flows.
- 💾 **Persistent App State**: Session tokens, user profile, and roadmap caching via AsyncStorage.
- 🔔 **Local Scheduling**: Alarm-style local scheduling screens for reminders (implementation present, package alignment to be validated).

## Screenshots

> To be updated

- `docs/screenshots/login.png` - Login screen
- `docs/screenshots/home-dashboard.png` - Student dashboard
- `docs/screenshots/diagnostic-test.png` - Diagnostic test flow
- `docs/screenshots/roadmap.png` - AI roadmap view
- `docs/screenshots/ai-chat.png` - AI tutor chat
- `docs/screenshots/tpo-dashboard.png` - TPO dashboard

## Tech Stack

### Frontend

- React `19`
- React Native `0.81`
- Expo SDK `54` (dev client workflow)
- React Navigation (native stack + bottom tabs)
- Axios + Fetch APIs
- AsyncStorage (`@react-native-async-storage/async-storage`)
- UI/UX libs: `react-native-vector-icons`, `expo-linear-gradient`, `react-native-markdown-display`
- Device features: `expo-speech`, `expo-notifications`, `expo-location`, `expo-image-picker`

### Backend

- Authentication/Profile service (inferred via endpoints): **Spring Boot-style service** (To be updated)
- Assessment/Roadmap service: **Django-style service** (inferred from code comments)
- AI Tutor service: **FastAPI-style service** (inferred from code comments/endpoints)

### Database

- App-side persistence: AsyncStorage
- Server-side database technology: **To be updated**

### AI/ML

- External AI tutoring/chat service consumed via REST + streaming response handling in client
- Model/provider details: **To be updated**

### DevOps

- Expo + native Android/iOS projects in repo
- Android Gradle build system
- iOS CocoaPods/Podfile setup
- CI/CD workflows: **To be updated**

### Cloud

- Firebase Android configuration files present (`google-services.json`, Gradle plugin)
- Cloud provider/runtime for backend services: **To be updated**

## Architecture

AiTut follows a **mobile client + multi-service backend** architecture:

1. **Client App (this repo)**
   - Handles UI, navigation, session persistence, and role-based flows.
   - Uses Context API (`AuthContext`, `UserContext`) for global auth/profile/roadmap state.

2. **Auth/Profile Service**
   - Handles login/register/OTP/password reset and profile updates.

3. **Assessment Service**
   - Generates diagnostic tests, accepts submissions, computes onboarding status, and creates roadmaps.

4. **AI Service**
   - Supports chat and guided teach sessions (history + streaming answer delivery).

5. **Storage Strategy**
   - Tokens/user details/roadmap cached in AsyncStorage for app relaunch continuity.

## Folder Structure

```text
aitut/
├─ App.js
├─ AppNavigator.js
├─ index.js
├─ package.json
├─ app.json
├─ Constants/
│  └─ Api.js
├─ context/
│  ├─ AuthContext.js
│  └─ UserContext.js
├─ Screens/
│  ├─ Login.js
│  ├─ Register.js
│  ├─ VerifyOTP.js
│  ├─ Home.js
│  ├─ DiagnosticTest.js
│  ├─ RoadmapScreen.js
│  ├─ ChatScreen.js
│  ├─ TeachScreen.js
│  └─ TPO/
│     ├─ TPOHomeScreen.js
│     ├─ AddBranch.js
│     ├─ AddStudent.js
│     ├─ BranchWiseStudent.js
│     ├─ BranchReport.js
│     ├─ TPOProfile.js
│     └─ TPOPersonalInfo.js
├─ assets/
├─ android/
├─ ios/
└─ google-services.json
```

### Major Directories

- `Screens/`: Role-based UI flows (auth, student learning, AI tutor, TPO module).
- `context/`: Global state and data-sync orchestration.
- `Constants/`: API base URL configuration.
- `android/`, `ios/`: Native build targets for production mobile deployment.

## Getting Started

### Prerequisites

- Node.js `18+` (recommended)
- npm or pnpm
- Expo CLI tooling (via project scripts)
- Android Studio/Xcode for native builds

### Installation

```bash
git clone <repo-url>
cd aitut
npm install
```

### Environment Variables

The repository does not use `.env`-style app variables directly in JavaScript (`process.env`/`EXPO_PUBLIC_*` not detected). Native/build environment keys detected in iOS/Android configuration are listed below.

| Variable | Description |
| -------- | ----------- |
| `EXPO_USE_COMMUNITY_AUTOLINKING` | Controls Expo community autolinking behavior in native build setup. |
| `USE_CCACHE` | Optional iOS build cache toggle in Podfile. |
| `USE_FRAMEWORKS` | Controls iOS framework linkage mode (`use_frameworks!`). |
| `RCT_NEW_ARCH_ENABLED` | React Native new architecture toggle for iOS build config. |
| `EX_DEV_CLIENT_NETWORK_INSPECTOR` | Expo dev client network inspector toggle. |
| `RCT_USE_RN_DEP` | iOS React Native dependency build behavior flag. |
| `RCT_USE_PREBUILT_RNCORE` | iOS prebuilt RN core usage flag. |
| `NODE_BINARY` | Node executable path used by Xcode build script. |

> App-level production secrets and environment strategy: **To be updated**

### Running Locally

```bash
# Start Expo dev client server
npm run start

# Run Android build
npm run android

# Run iOS build
npm run ios

# Run web preview (if needed)
npm run web
```

## Build & Deployment

### Production Build

```bash
# Android production build (native)
cd android
# Windows
gradlew.bat assembleRelease
# macOS/Linux
./gradlew assembleRelease
```

```bash
# iOS production archive (from Xcode recommended)
# Open ios/aitut.xcworkspace and archive in Release mode
```

### Deployment Notes

- Backend deployment configuration is not present in this repository.
- Release pipeline/CI setup: **To be updated**

## API Integration

### Base URLs (from `Constants/Api.js`)

- Auth: `http://10.168.55.50:8080/api/auth`
- AI: `http://10.168.55.50:8001/api`
- Assessment: `http://10.168.55.50:8000/api`

> These are local/network IP-based endpoints. Production URLs should be externalized before release.

### Auth/Profile APIs

- `POST /login`
- `POST /register`
- `POST /verify-otp`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /user/{id}`
- `PUT /update-profile/basic/{id}`
- `PUT /update-profile/learning/{id}`
- `POST /tpo/invite-bulk`

### Assessment APIs

- `POST /assessment/generate/`
- `POST /assessment/submit/`
- `POST /roadmap/create/`
- `GET /roadmaps/latest/{userId}/`
- `GET /user-status/{userId}/`

### AI APIs

- `POST /api/chat` (constructed as `${AI_URL}/api/chat` in client)
- `GET /history/{userId}/{subject}/{day}`
- `POST /ask/{university}/{dept}/{year}/{subject}/{day}`

### Other Integrations

- Firebase Android setup files present
- `react-native-app-auth` dependency present
- Local notifications/scheduling screens present

## State Management

AiTut uses **React Context API** as the primary global state solution:

- `AuthContext`
  - Stores token/session/user details
  - Tracks onboarding flags (`isComplete`, `testCount`, `hasRoadmap`)
  - Handles sign-in, sign-out, storage restore, and profile sync

- `UserContext`
  - Manages roadmap data fetch/sync/cache
  - Coordinates server refresh and local roadmap persistence

No Redux/Zustand/MobX store implementation is detected.

## Authentication Flow

1. User registers with role selection.
2. OTP verification activates account.
3. User logs in and receives `accessToken` (+ optional `refreshToken`).
4. Token and user details are persisted in AsyncStorage.
5. `AppNavigator` routes by auth state + role (`TPO` vs non-TPO).
6. Forgot-password flow uses OTP + password reset endpoints.

## Key Learning Outcomes

- Multi-service API integration from a mobile client
- Role-based navigation and conditional product experiences
- Context-driven global state orchestration with local persistence
- Progressive onboarding workflow design for learning platforms
- Streaming AI response handling in React Native UI
- Native-ready Expo architecture (Android + iOS folders maintained)

## Future Enhancements

- Add environment-based API config (`dev/stage/prod`) and secure secret management
- Add robust error telemetry (Sentry/Crashlytics) and API observability
- Formalize CI/CD for Android/iOS release automation
- Complete Firebase feature integration documentation (or remove unused setup)
- Add automated tests (unit/integration/E2E) and quality gates
- Validate and standardize notification stack dependencies

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-change`)
3. Commit with clear messages
4. Open a pull request with testing notes and screenshots (if UI changes)

For major architecture changes, open an issue first to discuss scope and approach.

## License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
