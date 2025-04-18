from django.conf import settings
from django.db import models
from ..models.UserAuthentication_models import User

class Borrower(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    def __str__(self):
        return self.name
