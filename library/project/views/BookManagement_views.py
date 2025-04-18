from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models.BookManagement_models import Book
from ..models.BorrowingTransactions_models import BorrowedBook
from ..serializers.BookManagement_serializers import BookSerializer
from ..permissions import IsAdminUser,IsRegularUser
from django.http import HttpResponse
from reportlab.lib.pagesizes import A3, landscape, portrait, A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

import openpyxl
from django.http import HttpResponse


def export_books_to_excel(request):
    # Create a new Excel workbook and sheet
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Books"

    # Add headers
    headers = ["ID", "Title", "Author", "ISBN", "Status", "Published Date"]
    sheet.append(headers)

    # Fetch books from the database
    books = Book.objects.all()

    # Add book data to the sheet
    for book in books:
        sheet.append([
            book.id,
            book.title,
            book.author,
            book.isbn,
            book.status,
            book.published_date.strftime('%Y-%m-%d') if book.published_date else "N/A"
        ])

    # Create an HTTP response with an Excel file
    response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response["Content-Disposition"] = 'attachment; filename="books.xlsx"'

    # Save the workbook to the response
    workbook.save(response)

    return response


# class BookListView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         books = Book.objects.all()
#
#         for book in books:
#             book.status = "checked_out" if BorrowedBook.objects.filter(book=book, returned=False).exists() else "available"
#             book.save()
#
#         serializer = BookSerializer(books, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
class BookListView(generics.ListAPIView):
    queryset=Book.objects.all()
    serializer_class=BookSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields=["title","id"]

class BookCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            serializer = BookSerializer(book)
            return Response(serializer.data)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

class BookUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            serializer = BookSerializer(book, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

class BookDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            book.delete()
            return Response({'message': 'Book deleted successfully'}, status=status.HTTP_200_OK)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)


class BulkDeleteBooksView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request):
        book_ids = request.data.get("book_ids", [])

        if not book_ids:
            return Response({"error": "No book IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        books_deleted, _ = Book.objects.filter(id__in=book_ids).delete()

        return Response({"message": f"{books_deleted} books deleted successfully."}, status=status.HTTP_200_OK)





def export_books_pdf(request):
    # Set response and filename
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="books.pdf"'

    # Create PDF canvas
    c = canvas.Canvas(response, pagesize=portrait(A4))

    # Title
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 800, "Book Details")

    # Fetch book data
    books = Book.objects.all()

    # Table headers
    headers = ["ID", "Title", "Author", "ISBN", "Status", "Published Date"]
    data = [headers]  # Start with headers

    # Add book rows
    for book in books:
        data.append([
            str(book.id),
            book.title,
            book.author,
            book.isbn,
            book.status,
            book.published_date.strftime('%Y-%m-%d') if book.published_date else "N/A"
        ])

    # Create the table
    table = Table(data, colWidths=[40, 120, 100, 90, 80, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))

    # Set the starting position for the table
    x_start, y_start = 50, 750
    row_height = 25
    max_rows_per_page = 20

    # Paginate the table
    for i in range(0, len(data), max_rows_per_page):
        chunk = data[i : i + max_rows_per_page]

        # Ensure headers are included on each page
        if i != 0:
            chunk.insert(0, headers)

        table = Table(chunk, colWidths=[40, 120, 100, 90, 80, 90])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))

        table.wrapOn(c, x_start, y_start)
        table.drawOn(c, x_start, y_start - (row_height * len(chunk)))

        c.showPage()

    c.save()
    return response
