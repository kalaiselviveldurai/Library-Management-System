from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    force_password_change = models.BooleanField(default=True)


    address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_active_borrower = models.BooleanField(default=True)  # Indicates if the user is an active borrower

    def __str__(self):
        return self.username
