from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.shortcuts import get_object_or_404

from .models import Task
from .serializers import RegisterSerializer, TaskSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        status_param = self.request.query_params.get("status")
        if status_param in dict(Task.STATUS_CHOICES):
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["patch"], url_path="status")
    def set_status(self, request, pk=None):
        task = get_object_or_404(self.get_queryset(), pk=pk)
        status_value = request.data.get("status")
        if status_value not in dict(Task.STATUS_CHOICES):
            return Response(
                {"detail": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        task.status = status_value
        task.save(update_fields=["status"])
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TokenView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


class TokenRefresh(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

