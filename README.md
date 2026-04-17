# Tyvanta — Frontend

A React single-page application for the Tyvanta Learning + Service Booking Platform. Lets users register, browse courses, enroll, and book appointments. Includes a separate admin dashboard for course and appointment management.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [Architecture Decisions](#architecture-decisions)
- [Deploying to Vercel](#deploying-to-vercel)
- [Connecting to the Backend on Render](#connecting-to-the-backend-on-render)

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 19 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Build tool | Vite 8 |
| Styling | Inline styles + CSS-in-JSX (`<style>` blocks) |
| Auth | JWT stored in `localStorage` |

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
- The backend API running locally (see backend README) — default `http://localhost:8000`

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/tyvanta-frontend.git
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

> **Note:** All Vite environment variables must be prefixed with `VITE_` to be exposed to client-side code.

---

## Pages & Features

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Email + password login, stores JWT |
| `/register` | Public | Name, email, password registration |
| `/dashboard` | User | Overview of enrolled courses and upcoming appointments |
| `/catalog` | User | Browse all published courses, enroll with one click |
| `/my-learning` | User | View enrolled courses and progress |
| `/appointments` | User | Book new appointments, view and cancel existing ones |
| `/admin` | Admin only | Create/delete courses, view all appointments |

### Authentication flow

1. On login/register the API returns a JWT and a user object.
2. Both are stored in `localStorage` (`token` and `user`).
3. The Axios instance (`src/api/axios.js`) attaches `Authorization: Bearer <token>` to every request via an interceptor.
4. `ProtectedRoute` and `AdminRoute` (in `App.jsx`) guard routes and redirect accordingly.

---

## Architecture Decisions

- **No global state library.** Each page fetches its own data on mount. The app is small enough that React's built-in `useState`/`useEffect` is sufficient and keeps the bundle lean.
- **Inline styles + CSS-in-JSX.** Keeps component styles co-located and avoids a separate CSS pipeline. Responsive breakpoints are handled via `<style>` blocks with `@media` rules inside components.
- **Responsive layout pattern.** `Layout.jsx` composes `Sidebar` and `Topbar`. The sidebar is a fixed panel on desktop (`≥768 px`) and a slide-in overlay on mobile, triggered by a hamburger button in the Topbar. `Admin.jsx` mirrors this pattern independently since it doesn't use the shared Layout.
- **Axios interceptor.** A single interceptor in `api/axios.js` injects the JWT, so individual pages never handle auth headers.
- **Role-based routing.** `AdminRoute` in `App.jsx` checks `user.role === 'admin'` before rendering the admin page — non-admins are silently redirected to `/dashboard`.

---

## Deploying to Vercel

Vercel works great with Vite React apps and requires zero configuration files.

### Step-by-step

1. **Push your code to GitHub** (make sure `.env` is in `.gitignore` — it already is).

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository** → select your frontend repo.

3. Vercel will auto-detect Vite. Confirm these settings (they should be pre-filled):

   | Setting | Value |
   |---|---|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL, e.g. `https://tyvanta-api.onrender.com` |

5. Click **Deploy**. Vercel will build and publish the app. You'll get a live URL like `https://tyvanta.vercel.app`.

6. **SPA routing fix** — React Router handles routing client-side, so direct URL access (e.g. `https://tyvanta.vercel.app/dashboard`) needs to fall back to `index.html`. Create a `vercel.json` file in the project root:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

   Commit and push this file — Vercel will pick it up automatically on the next deploy.

### Subsequent deploys

Every push to your `main` branch triggers an automatic redeploy on Vercel. Pull request branches get their own preview URLs.

---

## Connecting to the Backend on Render

Once both services are deployed you need to make sure they can talk to each other:

### 1 — Set `VITE_API_URL` on Vercel

In your Vercel project → **Settings** → **Environment Variables**:

```
VITE_API_URL = https://tyvanta-api.onrender.com
```

Redeploy the frontend after saving.

### 2 — Set `CORS_ORIGIN` on Render

In your Render service → **Environment** tab:

```
CORS_ORIGIN = https://tyvanta.vercel.app
```

Render will restart the service automatically.

> **Why?** The backend's `app.js` uses `CORS_ORIGIN` to whitelist exactly one origin. If this doesn't match your Vercel URL, all API requests from the browser will be blocked by CORS.

### 3 — Verify

Open your Vercel app in the browser, open DevTools → **Network**, and log in. You should see requests going to `https://tyvanta-api.onrender.com/auth/login` with a `200` response and no CORS errors.

### Common gotchas

| Problem | Fix |
|---|---|
| `Network Error` / CORS blocked | `CORS_ORIGIN` on Render doesn't match your Vercel URL exactly (check for trailing slash) |
| Blank page on `/dashboard` (direct URL) | Add/commit `vercel.json` with the rewrite rule above |
| API returns 401 on all requests | `VITE_API_URL` is missing or wrong — check Vercel env vars and redeploy |
| Render service sleeps (free tier) | First request after idle takes ~30 s; the free tier spins down after 15 min of inactivity |