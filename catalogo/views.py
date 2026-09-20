from rest_framework import viewsets
from .models import Libro, Cliente, Pedido
from .serializers import LibroSerializer, ClienteSerializer, PedidoSerializer
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions

class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'ok': True})
        return Response({'ok': False, 'error': 'Credenciales inválidas'}, status=401)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'ok': True})


class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({'autenticado': True, 'username': request.user.username})
        return Response({'autenticado': False})
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_destroy(self, instance):
        # Devolver el stock de cada detalle antes de borrar el pedido
        for detalle in instance.detalles.all():
            detalle.libro.stock += detalle.cantidad
            detalle.libro.save()
        instance.delete()