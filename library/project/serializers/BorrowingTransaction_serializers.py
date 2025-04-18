from rest_framework import serializers
from ..models.BorrowingTransactions_models import BorrowedBook
from ..models.UserAuthentication_models import User
from ..models.BookManagement_models import Book

class BorrowedBookSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    book = serializers.StringRelatedField()

    class Meta:
        model = BorrowedBook
        fields = '__all__'

class BorrowBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = BorrowedBook
        fields = ['book', 'due_date']

    def validate(self, data):

        book = data['book']
        if book.status == 'checked_out':
            raise serializers.ValidationError("This book is already checked out.")
        return data
