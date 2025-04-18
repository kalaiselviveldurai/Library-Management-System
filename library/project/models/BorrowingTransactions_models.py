from django.db import models
from .BookManagement_models import Book
from .UserAuthentication_models import User

class BorrowedBook(models.Model):
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="borrowed_books")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="borrowed_instances")
    borrowed_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.borrower.username} borrowed {self.book.title}"

    class Meta:
        ordering = ['-borrowed_at']  # Latest borrowed books appear first
