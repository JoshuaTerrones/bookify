from rest_framework.routers import DefaultRouter
from .views import LibroViewSet, ClienteViewSet, PedidoViewSet

router = DefaultRouter()
router.register(r'libros', LibroViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)

urlpatterns = router.urls