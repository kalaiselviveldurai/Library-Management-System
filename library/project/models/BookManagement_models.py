from django.db import models

class Book(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('checked_out', 'Checked Out'),
    ]

    title = models.CharField(max_length=100, unique=True)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title
