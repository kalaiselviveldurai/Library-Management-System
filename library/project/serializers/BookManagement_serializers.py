from rest_framework import serializers
from ..models.BookManagement_models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

    def validate_isbn(self, value):
        print("Received ISBN:", repr(value))

        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("ISBN must be a 13-digit numeric string.")
        return value

    def validate_title(self, value):

        if not value.strip():
            raise serializers.ValidationError("Book title cannot be empty.")
        return value
