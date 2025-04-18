import secrets
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ..models.UserAuthentication_models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        random_password = secrets.token_urlsafe(10)
        validated_data['password'] = make_password(random_password)

        user = User.objects.create(**validated_data)
        user.force_password_change = True
        user.save()


        user.generated_password = random_password
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])

        return super().update(instance, validated_data)
