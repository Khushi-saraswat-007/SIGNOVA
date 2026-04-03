# Signova — AI Sign Language Recognition System

> Real-time sign language recognition powered by AI, built for accessibility and inclusion.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

---

## Overview

**Signova** is a full-stack AI-powered sign language recognition application that enables real-time gesture detection and interactive learning. The frontend is built with React and features a sleek dark-themed UI across 10 functional modules — from live sign detection to an immersive conversation mode.

---

## Features

- 🖐️ **Live Sign Detection** — Real-time hand gesture recognition via webcam using MediaPipe
- 💬 **Conversation Mode** — Fluid two-way communication using detected signs
- 📚 **Interactive Learning** — Guided modules to learn and practice sign language
- 🌑 **Dark-Themed UI** — Consistent, accessibility-focused dark design system
- ⚡ **Low-Latency Processing** — Optimized pipeline between frontend and FastAPI backend
- 📱 **Responsive Layout** — Works across desktop and mobile devices

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| Gesture Engine | MediaPipe Hands |
| Backend API | FastAPI (Python) |
| Camera Access | WebRTC / getUserMedia |
| State Management | React Hooks (useState, useEffect, useRef) |

---

## Project Structure

```
signova-frontend/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   ├── LiveDetection/
│   │   ├── ConversationMode/
│   │   ├── LearningModules/
│   │   └── shared/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Backend server running (FastAPI) — see [signova-backend](#)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/signova-frontend.git
cd signova-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MEDIAPIPE_MODEL_PATH=/models
```

---

## Modules

| # | Module | Description |
|---|---|---|
| 1 | Live Sign Detection | Webcam-based real-time hand tracking |
| 2 | Conversation Mode | Sign-to-text communication interface |
| 3 | Learning Hub | Structured lessons for beginners |
| 4 | Practice Mode | Timed gesture practice with feedback |
| 5 | Sign Dictionary | Searchable reference for signs |
| 6 | Progress Tracker | User learning analytics |
| 7 | Quiz Mode | Test your sign language knowledge |
| 8 | Alphabet Board | Fingerspelling trainer |
| 9 | Phrase Builder | Combine signs into full phrases |
| 10 | Settings | Customize detection sensitivity and UI |

---

## Backend Integration

Signova's frontend communicates with a **FastAPI** backend for:
- Model inference on captured gesture frames
- User session and progress data
- Sign dictionary API

Make sure the backend is running before starting the frontend. Refer to the backend repository for setup instructions.

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---


## Code Comments

All comments throughout the **frontend codebase** have been written by **team member** to improve readability and understanding. Each component, hook, and utility function is annotated to explain the logic behind implementation decisions — making it easier for contributors and reviewers to follow the code flow without prior context.

---

## Acknowledgements

- [MediaPipe](https://mediapipe.dev/) — Hand landmark detection
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling

---

