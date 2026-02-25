from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task
from .services import calculate_priority_score

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "deadline",
            "effort",
            "complexity",
            "priority_score",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["priority_score", "created_at", "updated_at"]

    def validate_effort(self, value: int) -> int:
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Effort must be between 1 and 10.")
        return value

    def validate_complexity(self, value: int) -> int:
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Complexity must be between 1 and 10.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        score = calculate_priority_score(
            deadline=validated_data["deadline"],
            effort=validated_data["effort"],
            complexity=validated_data["complexity"],
        )
        validated_data["priority_score"] = score
        return Task.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        for field in ["title", "description", "deadline", "effort", "complexity", "status"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        score = calculate_priority_score(
            deadline=instance.deadline,
            effort=instance.effort,
            complexity=instance.complexity,
        )
        instance.priority_score = score
        instance.save()
        return instance

