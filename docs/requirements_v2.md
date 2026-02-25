# SmartStudy – Phase 2 Requirements (v2)

This document refines the Phase 1 requirements into a sprint-ready backlog with clear traceability to API endpoints, UI screens, and test types.

## 1. Functional Requirements Backlog

| ID    | User Story                                                                 | Acceptance Criteria                                                                                                              | API Endpoint(s)                          | UI Screen(s)              | Test Type(s)                    | Status |
|-------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|---------------------------|---------------------------------|--------|
| FR-01 | As a user, I can register an account so I can use SmartStudy securely.    | Valid data creates a new user; duplicate email is rejected; password meets minimum rules.                                       | `POST /api/auth/register/`               | Register                  | API tests, validation tests     | ✅ Done |
| FR-02 | As a user, I can log in and receive a token so I can access my tasks.     | Correct credentials return access (and refresh) token; wrong credentials are rejected.                                          | `POST /api/auth/token/`                  | Login                     | API tests, security tests       | ✅ Done |
| FR-03 | As a user, I can view my tasks in a list.                                 | Only tasks for the authenticated user are returned; tasks are sorted by `priority_score` descending by default.                | `GET /api/tasks/`                        | Dashboard                 | API tests, UI integration       | ✅ Done |
| FR-04 | As a user, I can create a new task.                                       | Valid task data is stored with correct `priority_score`; invalid data returns proper errors.                                   | `POST /api/tasks/`                       | Add Task                  | API tests, validation tests     | ✅ Done |
| FR-05 | As a user, I can see tasks ranked by priority using a clear scoring rule. | A task due sooner ranks higher if effort and complexity are equal; a task with higher effort ranks higher if deadline equal.   | `GET /api/tasks/` (ordering by score)    | Dashboard                 | Priority engine tests           | ✅ Done |
| FR-06 | As a user, I can update an existing task.                                 | Updating deadline/effort/complexity automatically recalculates `priority_score`.                                               | `PUT /api/tasks/{id}/`                   | Edit Task                 | API tests, engine tests         | ✅ Done |
| FR-07 | As a user, I can mark a task as completed.                                | Status changes from `pending` to `completed`; invalid status values are rejected with 400; completed tasks are visually distinguished. | `PATCH /api/tasks/{id}/status/`     | Dashboard                 | API tests, UI integration       | ✅ Done |
| FR-08 | As a user, I can delete a task.                                           | Task is removed and no longer appears for the user.                                                                             | `DELETE /api/tasks/{id}/`                | Dashboard                 | API tests                       | ✅ Done |
| FR-09 | As a user, I see validation messages when I enter invalid task data.      | Frontend shows field-level error messages for required fields and ranges (effort 1–10, complexity 1–10); backend returns 400 with clear error messages. | `POST /api/tasks/`, `PUT /api/tasks/{id}/` | Add Task, Edit Task  | UI validation, API tests        | ✅ Done |
| FR-10 | As a user, I can filter tasks by status.                                  | `GET /api/tasks/?status=pending` returns only pending tasks; `GET /api/tasks/?status=completed` returns only completed tasks; filtering is applied server-side at the database level. | `GET /api/tasks/?status=` | Dashboard (filter tabs) | API tests, UI integration | ✅ Done |

### Example for FR-05 – Priority Scoring

- **Rule 1**: A task due sooner must rank higher if effort and complexity are equal.  
- **Rule 2**: A task with higher effort must rank higher if deadline is equal.

Example comparison:

- Task A: due in 2 days, effort 8, complexity 5  
- Task B: due in 10 days, effort 3, complexity 5  

According to the rules, **Task A must receive a higher `priority_score` and appear above Task B** on the dashboard.

## 2. Non-Functional Requirements (NFRs)

- **NFR-01 Performance**:  
  - Backend should respond to typical dashboard requests (task list < 100 items) in under 500 ms on the chosen hosting platform.
- **NFR-02 Security**:  
  - All task endpoints require valid JWT access token.  
  - Users must not be able to access or modify other users’ tasks.
- **NFR-03 Usability**:  
  - Forms must display clear validation messages.  
  - Dashboard must show an empty-state message when no tasks exist.
- **NFR-04 Maintainability**:  
  - Code is structured by layers (models, serializers, services, views).  
  - Priority scoring logic is isolated in a dedicated service function.
- **NFR-05 Compatibility**:  
  - Frontend supports the latest versions of Chrome and Edge.

## 3. Traceability Notes

- Each FR is linked to:
  - One or more **API endpoints** in the Django REST API.
  - At least one **UI screen** in the React frontend.
  - At least one **test type** in `docs/test_plan.md`.
- NFR-02 (security) is verified by `test_unauthorized_requests_fail` and `test_user_cannot_access_another_users_task`.
- All 10 FRs and NFR-02 have passing automated tests — **15 / 15 pytest tests pass** as of Phase 2 completion.

This document will be updated if new requirements are discovered during development.

