# SmartStudy – Phase 2

> A study task prioritisation app that automatically ranks tasks by deadline urgency, effort, and complexity.

---

## What it does

SmartStudy helps students decide **what to study next** by scoring every task with a priority formula:

```
Priority Score = (1 / (days_until_deadline + 1)) × 100 + effort × 2 + complexity
```

- Tasks with **closer deadlines** rank higher automatically
- Tasks with **higher effort or complexity** carry extra weight
- The dashboard always shows tasks **highest-priority first**
- Users can **filter** by Pending or Completed status

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, Django 5.2.11, Django REST Framework 3.16.1 |
| Auth | `djangorestframework-simplejwt` 5.5.1 — JWT Bearer tokens |
| CORS | `django-cors-headers` 4.9.0 |
| Database | SQLite (file-based, zero config) |
| Testing | `pytest` 9.0.2 + `pytest-django` 4.12.0 |
| Frontend | React 18.3.0 + Vite 5.0.0 |
| HTTP client | Axios 1.7.0 |
| Routing | react-router-dom 6.22.0 |
| Fonts | Google Fonts — Inter |
| Container | Docker + docker-compose |

---

## Project Structure

```
Project/
├── backend/
│   ├── smartstudy/
│   │   ├── settings.py       # Django config, JWT, CORS, DB switching
│   │   └── urls.py           # Root routes → /admin/ and /api/
│   ├── tasks/
│   │   ├── models.py         # Task model (title, deadline, effort, complexity, priority_score, status)
│   │   ├── serializers.py    # Validation + auto priority score calculation
│   │   ├── services.py       # calculate_priority_score() — pure, testable function
│   │   ├── views.py          # RegisterView, TaskViewSet (CRUD + set_status), JWT views
│   │   ├── urls.py           # API routes
│   │   ├── tests.py          # 15 pytest tests (FR-01 → FR-10, NFR-02)
│   │   └── migrations/
│   │       └── 0001_initial.py
│   ├── conftest.py           # Shared pytest fixtures
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── index.html            # App shell + Google Fonts (Inter)
│   └── src/
│       ├── main.jsx          # Entry point — BrowserRouter, AuthProvider, CSS
│       ├── App.jsx           # Routes: /login /register / /tasks/new /tasks/:id
│       ├── index.css         # Complete design system (dark glassmorphism theme)
│       ├── config.js         # VITE_BACKEND_URL env var
│       ├── api/client.js     # Axios instance
│       ├── context/
│       │   └── AuthContext.jsx   # JWT token in React state (in-memory)
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx     # Stats row, filter tabs, task list
│       │   └── TaskForm.jsx      # Create / edit task form
│       └── components/
│           └── TaskList.jsx      # Task cards with priority stripe + score bubble
├── docs/
│   ├── requirements_v2.md    # FR-01–FR-10, NFR-01–NFR-05, traceability table
│   ├── architecture_v2.md    # Two-tier architecture diagrams
│   ├── decisions.md          # Architecture Decision Records (ADRs)
│   └── test_plan.md          # Testing strategy and coverage plan
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Create new user account | None |
| POST | `/api/auth/token/` | Login — returns JWT access + refresh tokens | None |
| POST | `/api/auth/token/refresh/` | Refresh access token | None |
| GET | `/api/tasks/` | List all tasks for the authenticated user | JWT |
| GET | `/api/tasks/?status=pending` | Filter tasks by status server-side | JWT |
| POST | `/api/tasks/` | Create a new task | JWT |
| GET | `/api/tasks/{id}/` | Retrieve a single task | JWT |
| PUT | `/api/tasks/{id}/` | Update task (recalculates priority score) | JWT |
| DELETE | `/api/tasks/{id}/` | Delete a task | JWT |
| PATCH | `/api/tasks/{id}/status/` | Set task status (`pending` or `completed`) | JWT |

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

---

### Backend

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the database tables
python manage.py makemigrations
python manage.py migrate

# 4. Start the dev server
python manage.py runserver
# → http://localhost:8000
```

**Run tests:**
```bash
pytest tasks/tests.py -v
# Expected: 15 passed
```

---

### Frontend

> **Windows note:** If PowerShell blocks `npm`, use the full path:
> `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install`

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser (not port 8000 — that is the API only).

---

## Environment Variables

Copy `.env.example` to `.env` if needed. For local development with SQLite, only these matter:

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | *(set this)* | Django secret key — use 32+ random characters |
| `DJANGO_DEBUG` | `True` | Set to `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost` | Comma-separated allowed hosts |
| `VITE_BACKEND_URL` | `http://localhost:8000/api/` | Backend API base URL used by the frontend |

> **Note:** The project uses **SQLite** by default (no database setup required). The `DB_*` environment variables in `.env.example` are only needed if switching to PostgreSQL in production.

---

## Test Coverage

| Test | Requirement |
|---|---|
| `test_register_creates_user` | FR-01 |
| `test_token_endpoint_returns_access_token` | FR-02 |
| `test_create_task_assigns_priority_score` | FR-04 |
| `test_list_tasks_returns_only_user_tasks` | FR-03 |
| `test_update_task_recalculates_priority` | FR-06 |
| `test_mark_task_complete` | FR-07 |
| `test_set_status_rejects_invalid_value` | FR-07 |
| `test_delete_task` | FR-08 |
| `test_invalid_effort_rejected` | FR-09 |
| `test_invalid_complexity_rejected` | FR-09 |
| `test_status_filter_returns_only_matching_tasks` | FR-10 |
| `test_unauthorized_requests_fail` | NFR-02 |
| `test_user_cannot_access_another_users_task` | NFR-02 |
| `test_priority_score_rules` | FR-05 |
| `test_higher_effort_increases_score_when_deadline_equal` | FR-05 |

**Result: 15 / 15 passing**

---

## Branching Model

| Branch | Purpose |
|---|---|
| `main` | Stable, releasable code |
| `dev` | Active integration branch |
| `feature/auth` | Authentication features |
| `feature/tasks` | Task CRUD features |
| `feature/priority` | Priority scoring logic |
| `feature/dashboard` | Dashboard UI |

Tags: `v0.2.0-phase2-sprint1`, etc.

---

## Known Limitations

| Issue | Notes |
|---|---|
| Token lost on page refresh | JWT stored in React state (in-memory by design). User must re-login after refresh. Refresh token flow not yet implemented on frontend. |
| CORS | `CORS_ALLOW_ALL_ORIGINS = True` in dev. Must be restricted to specific origins in production. |
| No pagination | All tasks returned at once from `/api/tasks/`. |
