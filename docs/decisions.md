# SmartStudy – Key Design Decisions (Phase 2)

This document summarizes the main design and technology decisions made in Phase 2 and the reasons behind them.

## D-01 – Use Django + Django REST Framework for the Backend

- **Options considered**: Flask + extensions, FastAPI, Django + DRF.
- **Decision**: Use **Django 5.x** with **Django REST Framework**.
- **Rationale**:
  - Built-in admin and auth system reduce boilerplate.
  - DRF provides serializers, viewsets, and authentication integrations out of the box.
  - Strong ecosystem and documentation, easier for long-term maintenance.

## D-02 – Use SQLite as the Database

- **Options considered**: SQLite, PostgreSQL, MySQL.
- **Decision**: Use **SQLite** (Django default, file-based).
- **Rationale**:
  - Zero configuration — no separate database server process needed.
  - Sufficient for development and small-scale single-user deployments.
  - Django's ORM makes it straightforward to switch to PostgreSQL in production by changing `DATABASES` settings and installing `psycopg2`.

## D-03 – Use JWT (djangorestframework-simplejwt) for Authentication

- **Options considered**: Session-based auth, JWT-based auth.
- **Decision**: Use **JWT** via `djangorestframework-simplejwt`.
- **Rationale**:
  - Works well for SPA clients like React.
  - Tokens are sent in the `Authorization: Bearer <token>` header, set explicitly after login.
  - Library is well-maintained and integrates with DRF permissions.

## D-04 – Use React + Vite for the Frontend

- **Options considered**: React (CRA), React + Vite, Next.js.
- **Decision**: Use **React + Vite**.
- **Rationale**:
  - Very fast development server and build tooling.
  - Simple configuration suited to a small SPA with a few screens.
  - Familiar React component model.

## D-05 – Priority Scoring Implemented as a Separate Service Function

- **Decision**: Implement priority scoring in a dedicated service (e.g. `tasks/services.py`) instead of embedding logic directly in the model or views.
- **Rationale**:
  - Keeps logic testable in isolation.
  - Makes it easier to adjust the algorithm in Phase 3 without touching controllers.

## D-06 – Store Access Token in React State (In-Memory)

- **Decision**: Store the JWT access token in React context (in-memory only). It is **never written to `localStorage` or `sessionStorage`**.
- **Rationale**:
  - Reduces XSS risk — a malicious script cannot read the token from storage.
  - Simple enough for a student project without a full token-refresh infrastructure.
- **Trade-off**: The token is lost on page refresh, forcing the user to log in again. A refresh token mechanism has not been implemented on the frontend.

## D-07 – Server-Side Status Filtering via Query Parameter

- **Decision**: Implement `?status=` query parameter filtering in `TaskViewSet.get_queryset()` (FR-10) rather than relying solely on client-side filtering.
- **Rationale**:
  - Client-side filtering requires all tasks to be fetched first, which does not scale.
  - A simple `qs.filter(status=status_param)` in `get_queryset()` pushes the work to the database with no extra endpoints.
  - The query param is validated against `Task.STATUS_CHOICES` to prevent arbitrary filter injection.

