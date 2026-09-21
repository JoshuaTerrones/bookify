from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    LibroViewSet,
    ClienteViewSet,
    PedidoViewSet,
    UserViewSet,
    EstadisticasView,
    ExportarCSVView,
    ExportarPDFView,
)

router = DefaultRouter()
router.register(r'libros', LibroViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'usuarios', UserViewSet)

urlpatterns = [
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('exportar/<str:recurso>/csv/', ExportarCSVView.as_view(), name='exportar-csv'),
    path('exportar/<str:recurso>/pdf/', ExportarPDFView.as_view(), name='exportar-pdf'),
] + router.urls