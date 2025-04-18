import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models.BorrowerManagement_model import Borrower
from ..serializers.BorrowerManagement_serializer import BorrowerSerializer
from ..serializers.UserAuthentication_serializers import UserSerializer
from ..models.UserAuthentication_models import User
from ..permissions import IsAdminUser


class BorrowerListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        borrowers = Borrower.objects.all()
        serializer = BorrowerSerializer(borrowers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name')
        user = User.objects.filter(email=email).first()

        if not user:
            return Response({'error': 'User is not registered. Please register first.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if Borrower.objects.filter(user=user).exists():
            return Response({'error': 'User is already registered as a borrower.'}, status=status.HTTP_400_BAD_REQUEST)

        borrower = Borrower.objects.create(
            user=user,
            name=name,
            email=email,
            borrower_id=str(uuid.uuid4())
        )

        return Response({'message': 'Borrower registered successfully.', 'borrower_id': borrower.borrower_id},
                        status=status.HTTP_201_CREATED)


class BorrowerDetailView(APIView):
    def get(self, request, id):
        try:
            borrower = User.objects.get(id=id)  # Ensure it uses the correct model
            serializer = UserSerializer(borrower)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Borrower not found"}, status=status.HTTP_404_NOT_FOUND)
    # def put(self, request, id):
    #     try:
    #         borrower = Borrower.objects.get(id=id)
    #     except Borrower.DoesNotExist:
    #         return Response({'error': 'Borrower profile not found'}, status=status.HTTP_404_NOT_FOUND)
    #
    #     serializer = BorrowerSerializer(borrower, data=request.data, context={'request': request})
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BorrowerDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, id):
        try:
            borrower = Borrower.objects.get(id=id)
        except Borrower.DoesNotExist:
            return Response({'error': 'Borrower profile not found'}, status=status.HTTP_404_NOT_FOUND)

        borrower.delete()
        return Response({'message': 'Borrower deleted successfully'}, status=status.HTTP_200_OK)
