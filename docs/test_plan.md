# SmartStudy – Phase 2 Test Plan

This document describes the testing strategy and coverage for SmartStudy during Phase 2.

## 1. Objectives

- Verify that all functional requirements (FR-01 – FR-10) behave as expected.
- Verify key non-functional requirements around security, usability, and maintainability.
- Provide evidence of automated tests (pytest) and manual UI verification.

---

## 2. Test Types

- **Unit tests**:
  - Priority scoring function (`tasks/services.py`).
- **API tests** (pytest-django):
  - Auth endpoints (`/api/auth/register/`, `/api/auth/token/`).
  - Task endpoints (`/api/tasks/`, `/api/tasks/{id}/`, `/api/tasks/{id}/status/`).
  - Validation endpoints (effort/complexity range errors).
  - Security: unauthorised access, cross-user data isolation.
- **Integration tests** (manual):
  - React forms + API: login, register, create task, edit task, mark complete, delete, filter.
- **Smoke test**:
  - Basic health of backend (`python manage.py runserver`) and frontend (`npm run dev`) on startup.

---

## 3. Backend Test Cases — Implemented

All tests live in `backend/tasks/tests.py` and are run with `pytest`.

### Auth (FR-01, FR-02)

| Test | Requirement | Expected result |
|---|---|---|
| `test_register_creates_user` | FR-01 | POST to `/api/auth/register/` → 201, user created |
| `test_token_endpoint_returns_access_token` | FR-02 | POST to `/api/auth/token/` with valid creds → 200, access token returned |

### Tasks – CRUD (FR-03, FR-04, FR-06, FR-08)

| Test | Requirement | Expected result |
|---|---|---|
| `test_list_tasks_returns_only_user_tasks` | FR-03 | GET `/api/tasks/` → only the authenticated user's tasks |
| `test_create_task_assigns_priority_score` | FR-04 | POST `/api/tasks/` → 201, `priority_score` is set correctly |
| `test_update_task_recalculates_priority` | FR-06 | PUT with a nearer deadline → `priority_score` increases |
| `test_delete_task` | FR-08 | DELETE `/api/tasks/{id}/` → 204, task no longer exists |

### Status Management (FR-07)

| Test | Requirement | Expected result |
|---|---|---|
| `test_mark_task_complete` | FR-07 | PATCH `/api/tasks/{id}/status/` `{"status":"completed"}` → 200 |
| `test_set_status_rejects_invalid_value` | FR-07 | PATCH with `{"status":"invalid"}` → 400 |

### Validation (FR-09)

| Test | Requirement | Expected result |
|---|---|---|
| `test_invalid_effort_rejected` | FR-09 | POST with `effort=0` → 400 validation error |
| `test_invalid_complexity_rejected` | FR-09 | POST with `complexity=11` → 400 validation error |

### Status Filter (FR-10)

| Test | Requirement | Expected result |
|---|---|---|
| `test_status_filter_returns_only_matching_tasks` | FR-10 | `?status=pending` excludes completed tasks; `?status=completed` excludes pending |

### Priority Engine (FR-05)

| Test | Requirement | Expected result |
|---|---|---|
| `test_priority_score_rules` | FR-05 | Task due in 1 day scores higher than task due in 30 days |
| `test_higher_effort_increases_score_when_deadline_equal` | FR-05 | effort=9 scores higher than effort=3 when deadline is equal |

### Security (NFR-02)

| Test | Requirement | Expected result |
|---|---|---|
| `test_unauthorized_requests_fail` | NFR-02 | GET `/api/tasks/` without token → 401 |
| `test_user_cannot_access_another_users_task` | NFR-02 | User A's token cannot GET User B's task → 404 |

---

## 4. Test Results

Run command:

```bash
cd backend
pytest tasks/tests.py -v
```

**Result as of Phase 2 completion:**

```
============================= test session info =============================
platform win32 -- Python 3.14.3, pytest-9.0.2
django: version: 5.2.11, settings: smartstudy.settings

tasks/tests.py::test_register_creates_user                             PASSED
tasks/tests.py::test_token_endpoint_returns_access_token               PASSED
tasks/tests.py::test_create_task_assigns_priority_score                PASSED
tasks/tests.py::test_list_tasks_returns_only_user_tasks                PASSED
tasks/tests.py::test_update_task_recalculates_priority                 PASSED
tasks/tests.py::test_mark_task_complete                                PASSED
tasks/tests.py::test_set_status_rejects_invalid_value                  PASSED
tasks/tests.py::test_delete_task                                        PASSED
tasks/tests.py::test_invalid_effort_rejected                           PASSED
tasks/tests.py::test_invalid_complexity_rejected                       PASSED
tasks/tests.py::test_status_filter_returns_only_matching_tasks         PASSED
tasks/tests.py::test_unauthorized_requests_fail                        PASSED
tasks/tests.py::test_user_cannot_access_another_users_task             PASSED
tasks/tests.py::test_priority_score_rules                              PASSED
tasks/tests.py::test_higher_effort_increases_score_when_deadline_equal PASSED

====================== 15 passed in 18.88s ======================
```

---

## 5. Traceability

Every test is linked to its FR/NFR via the table above. Summary:

| Requirement | Tests covering it |
|---|---|
| FR-01 | `test_register_creates_user` |
| FR-02 | `test_token_endpoint_returns_access_token` |
| FR-03 | `test_list_tasks_returns_only_user_tasks` |
| FR-04 | `test_create_task_assigns_priority_score` |
| FR-05 | `test_priority_score_rules`, `test_higher_effort_increases_score_when_deadline_equal` |
| FR-06 | `test_update_task_recalculates_priority` |
| FR-07 | `test_mark_task_complete`, `test_set_status_rejects_invalid_value` |
| FR-08 | `test_delete_task` |
| FR-09 | `test_invalid_effort_rejected`, `test_invalid_complexity_rejected` |
| FR-10 | `test_status_filter_returns_only_matching_tasks` |
| NFR-02 | `test_unauthorized_requests_fail`, `test_user_cannot_access_another_users_task` |
