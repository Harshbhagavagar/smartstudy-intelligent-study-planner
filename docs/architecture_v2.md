# SmartStudy – Phase 2 Architecture (v2)

This document describes the updated architecture for SmartStudy in Phase 2, aligned with the selected stack (Django REST API, React frontend, SQLite, JWT).

## 1. High-Level Overview

SmartStudy is a **two-tier web application**:

- **Frontend**: React + Vite SPA running in the browser.
- **Backend**: Django 5 + Django REST Framework providing a JSON API.
- **Database**: SQLite for persistent storage (file-based, zero config).

Communication between frontend and backend uses **HTTP + JSON** and **JWT-based authentication**.

## 2. Context View

System-level context:

- **Actors**
  - Student / learner (primary user).
  - Authentication provider (Django + JWT).
- **External systems**
  - Email provider (optional, for future notifications).
  - Hosting platforms (local development server).

SmartStudy exposes:

- `/api/auth/*` endpoints for registration and token management.
- `/api/tasks/*` endpoints for CRUD and status changes on tasks.

## 3. Building Block View

### Backend (Django + DRF)

- `smartstudy/` (project package)
  - `settings.py` – Django settings including REST framework, JWT, CORS, database.
  - `urls.py` – root URL configuration mapping `/api/` paths to app routes.
- `tasks/` (app)
  - `models.py` – `Task` model with fields: `user`, `title`, `description`, `deadline`, `effort`, `complexity`, `priority_score`, `status`, `created_at`, `updated_at`.
  - `serializers.py` – serializers for `Task` and registration.
  - `services.py` – priority scoring function used by views.
  - `views.py` – DRF views/viewsets for auth and task operations.
  - `urls.py` – app-level URL routing for `/api/auth/` and `/api/tasks/`.
  - `tests.py` – pytest-based tests for auth, tasks, and priority engine (15 tests, all passing).

### Frontend (React + Vite)

- `src/`
  - `main.jsx` – application entry, router setup.
  - `App.jsx` – route definitions.
  - `api/client.js` – Axios instance; JWT `Authorization` header is set manually per component after login.
  - `pages/Login.jsx`, `Register.jsx` – auth forms.
  - `pages/Dashboard.jsx` – task list, status filter, actions.
  - `pages/TaskForm.jsx` – add/edit task.
  - `components/TaskList.jsx` – list rendering and empty/loading states.
  - `context/AuthContext.jsx` – holds current user and access token in memory.

### Database (SQLite)

- `auth_user` – default Django user table (for authentication).
- `tasks_task` – task table with FK to user and all scoring fields.

> SQLite database file is located at `backend/db.sqlite3`. No separate database process is required.

## 4. Technology Choices (Summary)

- **Django + DRF**: mature, batteries-included framework with strong support for REST APIs and authentication.
- **JWT (djangorestframework-simplejwt)**: stateless API authentication, easy to integrate with React clients.
- **SQLite**: zero-config file-based database, ideal for development and small-scale deployments.
- **React + Vite**: fast dev environment and modern SPA tooling suitable for dashboards and forms.
- **pytest + pytest-django**: concise, readable test syntax integrated well with Django.

Detailed decisions are documented in `docs/decisions.md`.

## 5. Deployment View (Phase 2)

During Phase 2 (local development):

- **Backend** runs via the Django development server (`python manage.py runserver`) on `http://localhost:8000`.
- **Database** is SQLite — the `db.sqlite3` file is created automatically after running migrations. No separate database process needed.
- **Frontend** runs via the Vite dev server (`npm run dev`) on `http://localhost:5173`.
- The frontend calls the backend at `http://localhost:8000/api/` (configured via `VITE_BACKEND_URL` in `.env`).

No containerisation is used. Both servers are started independently in separate terminals.

## 6. Traceability to Requirements

- Every API endpoint in `tasks/urls.py` maps back to at least one FR in `requirements_v2.md`.
- Priority scoring logic in `tasks/services.py` directly implements FR-05 and related NFRs.
- The React screens implement the UI side of the same FRs.

