from datetime import date, timedelta

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Task
from .services import calculate_priority_score


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_register_creates_user(api_client):
    url = reverse("auth-register")
    resp = api_client.post(
        url,
        {
            "username": "newuser",
            "email": "new@example.com",
            "password": "StrongPass123",
        },
        format="json",
    )
    assert resp.status_code == 201


@pytest.mark.django_db
def test_token_endpoint_returns_access_token(api_client, user):
    url = reverse("token_obtain_pair")
    resp = api_client.post(
        url,
        {"username": "testuser", "password": "testpassword123"},
        format="json",
    )
    assert resp.status_code == 200
    assert "access" in resp.data


@pytest.mark.django_db
def test_create_task_assigns_priority_score(api_client, user):
    token_url = reverse("token_obtain_pair")
    token_resp = api_client.post(
        token_url,
        {"username": "testuser", "password": "testpassword123"},
        format="json",
    )
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}",
    )
    url = reverse("task-list")
    deadline = (date.today() + timedelta(days=5)).isoformat()
    resp = api_client.post(
        url,
        {
            "title": "Sample task",
            "description": "",
            "deadline": deadline,
            "effort": 5,
            "complexity": 5,
        },
        format="json",
    )
    assert resp.status_code == 201
    task = Task.objects.get(id=resp.data["id"])
    assert task.priority_score > 0


@pytest.mark.django_db
def test_list_tasks_returns_only_user_tasks(api_client, user, db):
    other_user = type(user).objects.create_user(
        username="other",
        email="other@example.com",
        password="otherpass123",
    )
    Task.objects.create(
        user=user,
        title="User task",
        deadline=date.today() + timedelta(days=3),
        effort=5,
        complexity=5,
    )
    Task.objects.create(
        user=other_user,
        title="Other task",
        deadline=date.today() + timedelta(days=3),
        effort=5,
        complexity=5,
    )
    token_url = reverse("token_obtain_pair")
    token_resp = api_client.post(
        token_url,
        {"username": "testuser", "password": "testpassword123"},
        format="json",
    )
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}",
    )
    url = reverse("task-list")
    resp = api_client.get(url)
    titles = [t["title"] for t in resp.data]
    assert "User task" in titles
    assert "Other task" not in titles


def test_priority_score_rules():
    today = date.today()
    a = calculate_priority_score(
        deadline=today + timedelta(days=2),
        effort=8,
        complexity=5,
    )
    b = calculate_priority_score(
        deadline=today + timedelta(days=10),
        effort=3,
        complexity=5,
    )
    assert a > b


# ---------------------------------------------------------------------------
# FR-06 – Update task recalculates priority score
# ---------------------------------------------------------------------------

@pytest.fixture
def auth_client(api_client, user):
    """Return an APIClient already authenticated as the test user."""
    token_url = reverse("token_obtain_pair")
    token_resp = api_client.post(
        token_url,
        {"username": "testuser", "password": "testpassword123"},
        format="json",
    )
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}",
    )
    return api_client


@pytest.fixture
def sample_task(user):
    """Create and return a task owned by the test user."""
    return Task.objects.create(
        user=user,
        title="Original task",
        deadline=date.today() + timedelta(days=10),
        effort=3,
        complexity=3,
    )


@pytest.mark.django_db
def test_update_task_recalculates_priority(auth_client, sample_task):
    """FR-06: PUT with a nearer deadline must produce a higher priority_score."""
    old_score = sample_task.priority_score
    url = reverse("task-detail", args=[sample_task.id])
    resp = auth_client.put(
        url,
        {
            "title": sample_task.title,
            "description": "",
            "deadline": (date.today() + timedelta(days=1)).isoformat(),
            "effort": sample_task.effort,
            "complexity": sample_task.complexity,
        },
        format="json",
    )
    assert resp.status_code == 200
    sample_task.refresh_from_db()
    assert sample_task.priority_score > old_score, (
        "priority_score should increase when deadline moves closer"
    )


# ---------------------------------------------------------------------------
# FR-07 – Mark task as completed via set_status action
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_mark_task_complete(auth_client, sample_task):
    """FR-07: PATCH tasks/{id}/status/ with completed changes the status."""
    url = reverse("task-set-status", args=[sample_task.id])
    resp = auth_client.patch(url, {"status": "completed"}, format="json")
    assert resp.status_code == 200
    assert resp.data["status"] == "completed"
    sample_task.refresh_from_db()
    assert sample_task.status == "completed"


@pytest.mark.django_db
def test_set_status_rejects_invalid_value(auth_client, sample_task):
    """FR-07: Invalid status value must return 400."""
    url = reverse("task-set-status", args=[sample_task.id])
    resp = auth_client.patch(url, {"status": "unknown"}, format="json")
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# FR-08 – Delete task
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_delete_task(auth_client, user, sample_task):
    """FR-08: DELETE tasks/{id}/ removes the task from the database."""
    task_id = sample_task.id
    url = reverse("task-detail", args=[task_id])
    resp = auth_client.delete(url)
    assert resp.status_code == 204
    assert not Task.objects.filter(id=task_id).exists()


# ---------------------------------------------------------------------------
# FR-09 – Validation messages for invalid effort / complexity
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_invalid_effort_rejected(auth_client):
    """FR-09: effort outside 1-10 must be rejected with 400."""
    url = reverse("task-list")
    resp = auth_client.post(
        url,
        {
            "title": "Bad effort",
            "deadline": (date.today() + timedelta(days=5)).isoformat(),
            "effort": 11,
            "complexity": 5,
        },
        format="json",
    )
    assert resp.status_code == 400
    assert "effort" in resp.data


@pytest.mark.django_db
def test_invalid_complexity_rejected(auth_client):
    """FR-09: complexity outside 1-10 must be rejected with 400."""
    url = reverse("task-list")
    resp = auth_client.post(
        url,
        {
            "title": "Bad complexity",
            "deadline": (date.today() + timedelta(days=5)).isoformat(),
            "effort": 5,
            "complexity": 0,
        },
        format="json",
    )
    assert resp.status_code == 400
    assert "complexity" in resp.data


# ---------------------------------------------------------------------------
# FR-10 – Filter tasks by status query param
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_status_filter_returns_only_matching_tasks(auth_client, user):
    """FR-10: ?status=pending must exclude completed tasks and vice-versa."""
    Task.objects.create(
        user=user,
        title="Pending task",
        deadline=date.today() + timedelta(days=5),
        effort=5,
        complexity=5,
        status="pending",
    )
    Task.objects.create(
        user=user,
        title="Done task",
        deadline=date.today() + timedelta(days=5),
        effort=5,
        complexity=5,
        status="completed",
    )

    url = reverse("task-list")

    # Filter pending
    resp = auth_client.get(url, {"status": "pending"})
    titles = [t["title"] for t in resp.data]
    assert "Pending task" in titles
    assert "Done task" not in titles

    # Filter completed
    resp = auth_client.get(url, {"status": "completed"})
    titles = [t["title"] for t in resp.data]
    assert "Done task" in titles
    assert "Pending task" not in titles


# ---------------------------------------------------------------------------
# NFR-02 – Security: unauthenticated / cross-user access
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_unauthorized_requests_fail(api_client):
    """NFR-02: Task endpoints must reject requests with no token."""
    url = reverse("task-list")
    resp = api_client.get(url)
    assert resp.status_code == 401


@pytest.mark.django_db
def test_user_cannot_access_another_users_task(api_client, user):
    """NFR-02: A user must not be able to read or modify another user's task."""
    other_user = type(user).objects.create_user(
        username="other2",
        email="other2@example.com",
        password="otherpass456",
    )
    other_task = Task.objects.create(
        user=other_user,
        title="Secret task",
        deadline=date.today() + timedelta(days=5),
        effort=5,
        complexity=5,
    )

    # Authenticate as the primary test user
    token_resp = api_client.post(
        reverse("token_obtain_pair"),
        {"username": "testuser", "password": "testpassword123"},
        format="json",
    )
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token_resp.data['access']}",
    )

    # Attempt to read other user's task directly
    resp = api_client.get(reverse("task-detail", args=[other_task.id]))
    assert resp.status_code == 404  # not visible to this user


def test_higher_effort_increases_score_when_deadline_equal():
    """FR-05 (engine): equal deadlines — higher effort must rank higher."""
    today = date.today()
    same_deadline = today + timedelta(days=5)
    high_effort = calculate_priority_score(
        deadline=same_deadline, effort=9, complexity=5
    )
    low_effort = calculate_priority_score(
        deadline=same_deadline, effort=2, complexity=5
    )
    assert high_effort > low_effort
