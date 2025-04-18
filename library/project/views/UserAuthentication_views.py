import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.shortcuts import render
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from ..models.UserAuthentication_models import User
from ..serializers.UserAuthentication_serializers import UserSerializer
from ..permissions import IsAdminUser
from rest_framework import generics

def home_page(request):
    return render(request, "home-page.html")

def generate_random_password(length=10):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user and user.is_staff:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "Login successful!"
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials or not an admin!"}, status=status.HTTP_401_UNAUTHORIZED)

def admin_login_page(request):
    return render(request, "admin_login.html")

class RegisterView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            random_password = getattr(user, 'generated_password', None)

            subject = "Account Registration Successful"
            message = (
                f"Hello {user.username},\n\n"
                f"Your account has been created.\n\n"
                f"Username: {user.username}\n"
                f"Password: {random_password}\n\n"
                f"Please log in and change your password.\n"
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)

            return Response({'message': 'User registered successfully. Email sent!'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


    filter_backends = [SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']


def register_page(request):
    return render(request, "register.html")

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user and not user.is_staff:
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh_token': str(refresh),
                'access_token': str(refresh.access_token),
            }

            print("User authenticated:", user.username)
            print("Tokens generated:", tokens)

            if user.force_password_change:
                print("User requires password change. Redirecting...")
                return Response({
                    'message': 'Password change required',
                    'tokens': tokens,
                    'redirect_to': '/project/changepassword-page/'
                }, status=status.HTTP_200_OK)

            print("Normal Login. Redirecting to User Dashboard...")
            return Response({
                'tokens': tokens,
                'redirect_to': '/project/user-dashboard/'
            }, status=status.HTTP_200_OK)

        print("Invalid credentials or unauthorized access.")
        return Response({'error': 'Invalid credentials or not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)


def login_page(request):
    return render(request, "login.html")

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            RefreshToken(refresh_token).blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(old_password, user.password):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.force_password_change = False
        user.save()

        return Response({'message': 'Password updated successfully. You can now log in.'}, status=status.HTTP_200_OK)

def admin_dashboard(request):
    return render(request, "admin_dashboard.html")

def changepassword_page(request):
    return render(request, "changepassword.html")

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def user_dashboard(request):
    return render(request, "user_dashboard.html")

from django.http import HttpResponse
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

def export_users_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="users.pdf"'

    c = canvas.Canvas(response, pagesize=landscape(A3))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, 1150, "User Details")

    users = User.objects.all()

    data = [["ID", "Username", "Email", "First Name", "Last Name"]]

    for user in users:
        data.append([
            str(user.id),
            user.username,
            user.email,
            user.first_name or "N/A",
            user.last_name or "N/A"
        ])

    table = Table(data, colWidths=[60, 150, 180, 130, 130])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))

    table.wrapOn(c, 50, 900)
    table.drawOn(c, 50, 900 - (30 * len(data)))

    c.showPage()
    c.save()
    return response

import openpyxl
def export_users_excel(request):
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Users"

    headers = ["ID", "Username", "Email", "First Name", "Last Name"]
    sheet.append(headers)

    users = User.objects.all()

    for user in users:
        sheet.append([
            user.id,
            user.username,
            user.email,
            user.first_name or "N/A",
            user.last_name or "N/A"
        ])

    response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response["Content-Disposition"] = "attachment; filename=users.xlsx"

    workbook.save(response)
    return response