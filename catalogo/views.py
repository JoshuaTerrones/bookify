from rest_framework import viewsets
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from django.http import HttpResponse
from io import BytesIO
import csv

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

from .models import Libro, Cliente, Pedido, DetallePedido
from .serializers import (
    LibroSerializer,
    ClienteSerializer,
    PedidoSerializer,
    UserSerializer,
)


# ============================================
# PERMISOS PERSONALIZADOS
# ============================================

class ReadOnlyOrDjangoModelPermissions(permissions.BasePermission):
    """
    Permite GET/HEAD/OPTIONS sin autenticación.
    Para POST/PUT/PATCH/DELETE, exige autenticación Y
    los permisos del grupo Django del usuario.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        model_name = view.basename.lower()

        if request.method == 'POST':
            codename = f'add_{model_name}'
        elif request.method in ['PUT', 'PATCH']:
            codename = f'change_{model_name}'
        elif request.method == 'DELETE':
            codename = f'delete_{model_name}'
        else:
            return False

        full_perm = f'catalogo.{codename}'
        return request.user.has_perm(full_perm)


class IsAdminGroup(permissions.BasePermission):
    """Solo permite acceso a usuarios del grupo 'admin' o superusers."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='admin').exists()


# ============================================
# VIEWSETS
# ============================================

class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer
    permission_classes = [ReadOnlyOrDjangoModelPermissions]


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated, ReadOnlyOrDjangoModelPermissions]


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [ReadOnlyOrDjangoModelPermissions]

    def perform_destroy(self, instance):
        for detalle in instance.detalles.all():
            detalle.libro.stock += detalle.cantidad
            detalle.libro.save()
        instance.delete()


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD de usuarios. Solo accesible por el grupo 'admin' o superusers.
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminGroup]


# ============================================
# AUTENTICACIÓN
# ============================================

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
            grupos = list(request.user.groups.values_list('name', flat=True))
            rol = 'admin'
            if grupos:
                if 'admin' in grupos:
                    rol = 'admin'
                elif 'editor' in grupos:
                    rol = 'editor'
                elif 'lector' in grupos:
                    rol = 'lector'

            return Response({
                'autenticado': True,
                'username': request.user.username,
                'rol': rol,
                'grupos': grupos,
            })
        return Response({'autenticado': False})


# ============================================
# ESTADÍSTICAS
# ============================================

class EstadisticasView(APIView):
    permission_classes = [IsAdminGroup]

    def get(self, request):
        # === Libros más vendidos ===
        libros_vendidos = DetallePedido.objects.values(
            'libro__id',
            'libro__titulo',
            'libro__autor',
        ).annotate(
            total_vendidos=Sum('cantidad'),
        ).order_by('-total_vendidos')[:5]

        libros_data = [
            {
                'id': item['libro__id'],
                'titulo': item['libro__titulo'],
                'autor': item['libro__autor'],
                'vendidos': item['total_vendidos'],
            }
            for item in libros_vendidos
        ]

        # === Clientes frecuentes ===
        clientes_frecuentes = Pedido.objects.values(
            'cliente__id',
            'cliente__nombre',
        ).annotate(
            total_pedidos=Count('id'),
        ).order_by('-total_pedidos')[:5]

        clientes_data = [
            {
                'id': item['cliente__id'],
                'nombre': item['cliente__nombre'],
                'pedidos': item['total_pedidos'],
            }
            for item in clientes_frecuentes
        ]

        # === Resumen general ===
        total_libros = Libro.objects.count()
        total_clientes = Cliente.objects.count()
        total_pedidos = Pedido.objects.count()
        agotados = Libro.objects.filter(stock=0).count()
        por_agotarse = Libro.objects.filter(stock__gt=0, stock__lt=5).count()
        return Response({
            'resumen': {
                'total_libros': total_libros,
                'total_clientes': total_clientes,
                'total_pedidos': total_pedidos,
                'agotados': agotados,
                'por_agotarse': por_agotarse,
            },
            'libros_mas_vendidos': libros_data,
            'clientes_frecuentes': clientes_data,
        })


# ============================================
# EXPORTAR CSV
# ============================================

class ExportarCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, recurso):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{recurso}.csv"'

        writer = csv.writer(response)

        if recurso == 'libros':
            writer.writerow(['ID', 'Título', 'Autor', 'Precio', 'Stock'])
            for libro in Libro.objects.all().order_by('id'):
                writer.writerow([libro.id, libro.titulo, libro.autor, libro.precio, libro.stock])

        elif recurso == 'clientes':
            writer.writerow(['ID', 'Nombre', 'Email'])
            for cliente in Cliente.objects.all().order_by('id'):
                writer.writerow([cliente.id, cliente.nombre, cliente.email])

        elif recurso == 'pedidos':
            writer.writerow(['ID Pedido', 'Cliente', 'Fecha', 'Libro', 'Cantidad'])
            for pedido in Pedido.objects.all().order_by('id'):
                for detalle in pedido.detalles.all():
                    writer.writerow([
                        pedido.id,
                        pedido.cliente.nombre,
                        pedido.fecha.strftime('%Y-%m-%d %H:%M') if pedido.fecha else '',
                        detalle.libro.titulo,
                        detalle.cantidad,
                    ])

        else:
            return HttpResponse('Recurso no válido', status=400)

        return response


# ============================================
# EXPORTAR PDF
# ============================================

class ExportarPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, recurso):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        if recurso == 'libros':
            title = Paragraph("<b>Listado de Libros</b>", styles['Title'])
            elements.append(title)
            elements.append(Spacer(1, 20))

            data = [['ID', 'Título', 'Autor', 'Precio', 'Stock']]
            for libro in Libro.objects.all().order_by('id'):
                data.append([
                    str(libro.id),
                    libro.titulo[:40],
                    libro.autor[:25],
                    f'S/ {libro.precio}',
                    str(libro.stock),
                ])
            col_widths = [0.6*inch, 2.6*inch, 2.2*inch, 0.9*inch, 0.7*inch]

        elif recurso == 'clientes':
            title = Paragraph("<b>Listado de Clientes</b>", styles['Title'])
            elements.append(title)
            elements.append(Spacer(1, 20))

            data = [['ID', 'Nombre', 'Email']]
            for cliente in Cliente.objects.all().order_by('id'):
                data.append([
                    str(cliente.id),
                    cliente.nombre,
                    cliente.email,
                ])
            col_widths = [0.8*inch, 3*inch, 3.2*inch]

        elif recurso == 'pedidos':
            title = Paragraph("<b>Listado de Pedidos</b>", styles['Title'])
            elements.append(title)
            elements.append(Spacer(1, 20))

            data = [['ID', 'Cliente', 'Libro', 'Cantidad']]
            for pedido in Pedido.objects.all().order_by('id'):
                for detalle in pedido.detalles.all():
                    data.append([
                        f'#{pedido.id}',
                        pedido.cliente.nombre[:25],
                        detalle.libro.titulo[:35],
                        str(detalle.cantidad),
                    ])
            col_widths = [0.8*inch, 2.5*inch, 2.7*inch, 1*inch]

        else:
            return HttpResponse('Recurso no válido', status=400)

        table = Table(data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#111827')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{recurso}.pdf"'
        return response