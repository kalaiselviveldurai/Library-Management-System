from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.timezone import now
from ..models.BorrowingTransactions_models import BorrowedBook
from ..models.BookManagement_models import Book
from ..models.UserAuthentication_models import User
from ..serializers.BorrowingTransaction_serializers import BorrowedBookSerializer
from ..permissions import IsRegularUser, IsAdminUser
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

class DashboardDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_users = User.objects.count()
        total_books = Book.objects.count()
        total_transactions = BorrowedBook.objects.count()

        return Response({
            "total_users": total_users,
            "total_books": total_books,
            "total_transactions": total_transactions
        }, status=status.HTTP_200_OK)


class BorrowedBooksForReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all books that the user has borrowed but not yet returned"""
        user = request.user
        borrowed_books = BorrowedBook.objects.filter(borrower=user, returned=False)

        books_data = []
        for record in borrowed_books:
            book = record.book
            books_data.append({
                "borrowed_id": record.id,
                "book_id": book.id,
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "due_date": record.due_date,
                "borrowed_at": record.borrowed_at,
                "status": "Borrowed",
            })

        return Response(books_data, status=status.HTTP_200_OK)


class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated, IsRegularUser]

    def post(self, request,book_id):
        user = request.user

        # book_id = request.data.get('book')
        due_date = request.data.get('due_date')

        try:
            book = Book.objects.get(id=book_id)
            if book.status == "checked_out":
                return Response({'error': 'Book is already checked out'}, status=status.HTTP_400_BAD_REQUEST)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        book.status = "checked_out"
        book.save()

        borrowed_book = BorrowedBook.objects.create(
            borrower=user,
            book=book,
            due_date=due_date
        )

        serializer = BorrowedBookSerializer(borrowed_book)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        user = request.user

        try:
            borrowed_book = BorrowedBook.objects.get(borrower=user, book_id=book_id, returned=False)
        except BorrowedBook.DoesNotExist:
            return Response({'error': 'No active borrowing record found for this book'}, status=status.HTTP_404_NOT_FOUND)

        book = borrowed_book.book
        book.status = "available"
        book.save()

        borrowed_book.returned = True
        borrowed_book.returned_at = now()
        borrowed_book.save()

        return Response({'message': 'Book returned successfully'}, status=status.HTTP_200_OK)

class BorrowingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        borrowed_books = BorrowedBook.objects.filter(borrower=request.user)
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserBorrowingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        borrowed_books = BorrowedBook.objects.filter(borrower=user).order_by('-borrowed_at')  # Fetch books for the logged-in user
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AllBorrowingHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        borrowed_books = BorrowedBook.objects.all()
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDashboardDataView(APIView):
    permission_classes = [IsAuthenticated,IsRegularUser]

    def get(self, request):
        user = request.user

        total_books = Book.objects.count()
        borrowed_books = BorrowedBook.objects.filter(borrower=user, returned=False).count()
        returned_books = BorrowedBook.objects.filter(borrower=user, returned=True).count()

        return Response({
            "total_books": total_books,
            "borrowed_books": borrowed_books,
            "returned_books": returned_books
        })
