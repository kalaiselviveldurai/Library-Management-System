from rest_framework import serializers
from django.contrib.auth.models import User
from ..models.BorrowerManagement_model import Borrower

class BorrowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Borrower
        fields = ['name', 'email','id']

    def create(self, validated_data):
        user = self.context['request'].user
        borrower, created = Borrower.objects.update_or_create(user=user, defaults=validated_data)
        return borrower
