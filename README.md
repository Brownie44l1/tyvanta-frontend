# Tyvanta — Frontend

A React single-page application for the Tyvanta Learning + Service Booking Platform. Users can register, browse courses, enroll, and book appointments. Includes a separate admin dashboard for course and appointment management.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [Architecture Decisions](#architecture-decisions)

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 19 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Build tool | Vite |
| Styling | Inline styles + CSS-in-JSX (`<style>` blocks) |
| Auth | JWT stored in `localStorage` |

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   React SPA (Vercel)                       │
│                                                            │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  /login  │  │  /register   │  │  /dashboard        │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  /catalog│  │ /my-learning │  │  /appointments     │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              /admin  (Admin role only)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   ProtectedRoute / AdminRoute — checks localStorage  │  │
│  │   Redirects unauthenticated users to /login          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Axios instance (src/api/axios.js)                  │  │
│  │   Attaches Authorization: Bearer <token> to all reqs │  │
│  └───────────────────────────┬──────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────┘
                               │ HTTP + JWT
                               ▼
              https://tyvanta-api.onrender.com
```

**Auth flow:**
1. User logs in → API returns JWT + user object
2. Both stored in `localStorage` (`token` and `user`)
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. `ProtectedRoute` / `AdminRoute` guard all non-public routes

---

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with base URL + JWT interceptor
├── components/
│   ├── Layout.jsx             # Shell: Sidebar + Topbar wrapper
│   ├── Sidebar.jsx            # Navigation sidebar (desktop fixed, mobile overlay)
│   ├── Topbar.jsx             # Top bar with hamburger, date, avatar
│   ├── ProtectedRoute.jsx     # Redirects unauthenticated users to /login
│   └── useToast.jsx           # Lightweight toast notification hook
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Catalog.jsx            # Browse all courses
│   ├── MyLearning.jsx         # Enrolled courses
│   ├── Appointments.jsx       # Book & view appointments
│   └── Admin.jsx              # Admin-only dashboard (course + appointment manager)
├── styles/
│   └── tokens.js              # Design tokens (colors, spacing)
├── utils/
│   └── courseHelpers.js
├── App.jsx                    # Routes definition
└── main.jsx                   # React entry point
```

---

## Getting Started (Local)

### Prerequisites

- Node.js 18+
- The backend API running locally (see [backend README](https://github.com/Brownie44l1/tyvanta-api)) — default `http://localhost:8000`

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Brownie44l1/tyvanta-frontend.git
cd tyvanta-frontend

# 2. Install dependencies
npm install

# 3. Create a local env file
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the backend API (no trailing slash) |

---

## Pages & Features

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Email + password login, stores JWT |
| `/register` | Public | Name, email, password registration |
| `/dashboard` | User | Overview of enrolled courses and upcoming appointments |
| `/catalog` | User | Browse all published courses, enroll with one click |
| `/my-learning` | User | View enrolled courses |
| `/appointments` | User | Book new appointments, view and cancel existing ones |
| `/admin` | Admin only | Create/delete courses, view all appointments |

---

## Architecture Decisions

**No global state library**  
Each page fetches its own data on mount using `useState` + `useEffect`. The app is small enough that React's built-in primitives are sufficient and keep the bundle lean.

**Axios interceptor for auth**  
A single interceptor in `src/api/axios.js` injects the JWT on every outbound request. Individual pages never handle auth headers — they just call the API functions and receive data.

**Inline styles + CSS-in-JSX**  
Keeps component styles co-located and avoids a separate CSS pipeline or class-name convention. Responsive breakpoints are handled via `<style>` blocks with `@media` rules inside components.

**Role-based routing**  
`AdminRoute` in `App.jsx` checks `user.role === 'admin'` from `localStorage` before rendering the admin page. Non-admins are redirected to `/dashboard`. The backend enforces this server-side too — the frontend check is purely UX.

**Responsive layout**  
`Layout.jsx` composes `Sidebar` and `Topbar`. The sidebar is a fixed panel on desktop (≥768 px) and a slide-in overlay on mobile, triggered by a hamburger button in the Topbar.

**JWT in `localStorage`**  
Chosen for simplicity in an assessment context. In a production app, `httpOnly` cookies would be preferred to mitigate XSS risk.