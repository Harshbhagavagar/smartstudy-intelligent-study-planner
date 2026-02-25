from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RegisterView, TaskViewSet, TokenRefresh, TokenView

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefresh.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]

