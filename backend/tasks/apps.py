import os

from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tasks"

    def ready(self):
        seed_enabled = os.getenv("DEFAULT_USER_SEED", "").lower() in ("1", "true", "yes")
        if not seed_enabled:
            return

        username = os.getenv("DEFAULT_USER_USERNAME", "User10")
        email = os.getenv("DEFAULT_USER_EMAIL", "user10@gmail.com")
        password = os.getenv("DEFAULT_USER_PASSWORD", "User@1010")
        force_reset = os.getenv("DEFAULT_USER_FORCE_RESET", "").lower() in (
            "1",
            "true",
            "yes",
        )

        try:
            User = get_user_model()
            user, created = User.objects.get_or_create(
                username=username, defaults={"email": email}
            )
            if created or force_reset:
                if email:
                    user.email = email
                user.set_password(password)
                user.save()
        except (OperationalError, ProgrammingError):
            # Database might not be ready during migrations/startup.
            return
