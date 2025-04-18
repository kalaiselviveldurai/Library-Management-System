from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views.BorrowerManagement_views import BorrowerDetailView
from .views.BorrowingTransactions_views import (BorrowBookView, ReturnBookView, BorrowingHistoryView, DashboardDataView,
                                                AllBorrowingHistoryView,UserDashboardDataView,BorrowedBooksForReturnView,
                                                UserBorrowingHistoryView)
from .views.UserAuthentication_views import (
    RegisterView, LoginView, LogoutView, register_page, login_page, ChangePasswordView,
    UserDeleteView, changepassword_page, home_page, AdminLoginView, admin_login_page,
    admin_dashboard, UserUpdateView, UserListView,user_dashboard,export_users_excel,export_users_pdf
)
from .views.BookManagement_views import BookListView, BookCreateView, BookDetailView, BookUpdateView, BookDeleteView, \
    BulkDeleteBooksView,export_books_to_excel,export_books_pdf

urlpatterns = [
    path('home/', home_page, name='home'),
    path('dashboard-data/', DashboardDataView.as_view(), name='dashboard-data'),
    path('adminlogin/', AdminLoginView.as_view(), name='adminlogin'),
    path("adminlogin-page/", admin_login_page, name="admin_login_page"),
    path("admin_dashboard/", admin_dashboard, name="admin_dashboard"),
    path('register/', RegisterView.as_view(), name='register'),
    path("register-page/", register_page, name="register_page"),
    path('login/', LoginView.as_view(), name='login'),
    path("login-page/", login_page, name="login_page"),
    path("changepassword/", ChangePasswordView.as_view(), name="changepassword"),
    path("changepassword-page/", changepassword_page, name="changepassword_page"),
    path("deleteuser/<int:id>/", UserDeleteView.as_view(), name="deleteuser"),
    path("updateuser/<int:id>/", UserUpdateView.as_view(), name="updateuser"),
    path("users/", UserListView.as_view(), name="user_list"),
    path('export-users-pdf/', export_users_pdf, name='export_users_pdf'),
    path('export-users-excel/', export_users_excel, name='export_users_excel'),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('logout/', LogoutView.as_view(), name='logout'),

    path('books/', BookListView.as_view(), name='book_list'),
    path('books/add/', BookCreateView.as_view(), name='add_book'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book_detail'),
    path('books/<int:pk>/update/', BookUpdateView.as_view(), name='update_book'),
    path('books/<int:pk>/delete/', BookDeleteView.as_view(), name='delete_book'),
    path('books/bulk-delete/', BulkDeleteBooksView.as_view(), name='bulk_delete_books'),
    path("export-books-excel/", export_books_to_excel, name="export_books"),

    path('borrow/<int:book_id>/', BorrowBookView.as_view(), name='borrow_book'),
    path('borrowers/<int:id>/', BorrowerDetailView.as_view(), name='borrower_detail'),

    path('borrowed-books/', BorrowedBooksForReturnView.as_view(), name='borrowed_books'),
    path('return/<int:book_id>/', ReturnBookView.as_view(), name='return_book'),
    path('history/', BorrowingHistoryView.as_view(), name='borrowing_history'),
    path('allhistory/', AllBorrowingHistoryView.as_view(), name='all_borrowing_history'),
    path('borrowing-history/', UserBorrowingHistoryView.as_view(), name='user_borrowing_history'),
    path("export-books-pdf/", export_books_pdf, name="export_books_pdf"),

    #user
    path('user-dashboard/', user_dashboard, name='user_dashboard'),
    path('user-dashboard-data/', UserDashboardDataView.as_view(), name='user_dashboard_data'),
]
