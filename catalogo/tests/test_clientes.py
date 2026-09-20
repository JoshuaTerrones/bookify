import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from catalogo.models import Cliente


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def usuario_admin(db):
    return User.objects.create_user(username='testuser', password='testpass123')


@pytest.fixture
def cliente_ejemplo(db):
    return Cliente.objects.create(nombre='Juan Pérez', email='juan@example.com')


@pytest.mark.django_db
def test_listar_clientes_requiere_auth(api_client):
    """Sin autenticación, no se puede listar clientes."""
    response = api_client.get('/api/clientes/')
    assert response.status_code in [401, 403]


@pytest.mark.django_db
def test_listar_clientes_con_auth(api_client, usuario_admin, cliente_ejemplo):
    """Con autenticación, se puede listar clientes."""
    api_client.force_authenticate(user=usuario_admin)
    response = api_client.get('/api/clientes/')
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]['nombre'] == 'Juan Pérez'


@pytest.mark.django_db
def test_crear_cliente(api_client, usuario_admin):
    """Un usuario autenticado puede crear clientes."""
    api_client.force_authenticate(user=usuario_admin)
    response = api_client.post('/api/clientes/', {
        'nombre': 'María López',
        'email': 'maria@example.com',
    })
    assert response.status_code == 201
    assert Cliente.objects.count() == 1
    assert Cliente.objects.first().nombre == 'María López'


@pytest.mark.django_db
def test_crear_cliente_email_duplicado_falla(api_client, usuario_admin, cliente_ejemplo):
    """No se puede crear un cliente con email duplicado."""
    api_client.force_authenticate(user=usuario_admin)
    response = api_client.post('/api/clientes/', {
        'nombre': 'Otro Juan',
        'email': 'juan@example.com',
    })
    assert response.status_code == 400