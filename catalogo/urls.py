from rest_framework.routers import DefaultRouter
from .views import LibroViewSet, ClienteViewSet

router = DefaultRouter()
router.register(r'libros', LibroViewSet)
router.register(r'clientes', ClienteViewSet)

urlpatterns = router.urls