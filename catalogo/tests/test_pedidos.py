import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from catalogo.models import Libro, Cliente, Pedido, DetallePedido


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def usuario_admin(db):
    return User.objects.create_superuser(
        username='testuser',
        email='test@test.com',
        password='testpass123'
    )


@pytest.fixture
def datos_base(db):
    libro = Libro.objects.create(
        titulo='Cien años de soledad',
        autor='Gabriel García Márquez',
        precio='45.00',
        stock=10,
    )
    cliente = Cliente.objects.create(nombre='Juan Pérez', email='juan@example.com')
    return {'libro': libro, 'cliente': cliente}


@pytest.mark.django_db
def test_crear_pedido_descuenta_stock(api_client, usuario_admin, datos_base):
    """Al crear un pedido, el stock del libro baja."""
    api_client.force_authenticate(user=usuario_admin)
    libro = datos_base['libro']
    cliente = datos_base['cliente']

    response = api_client.post('/api/pedidos/', {
        'cliente': cliente.id,
        'detalles': [{'libro': libro.id, 'cantidad': 3}],
    }, format='json')

    assert response.status_code == 201
    libro.refresh_from_db()
    assert libro.stock == 7


@pytest.mark.django_db
def test_crear_pedido_sin_stock_falla(api_client, usuario_admin, datos_base):
    """No se puede crear un pedido con más cantidad que el stock."""
    api_client.force_authenticate(user=usuario_admin)
    libro = datos_base['libro']
    cliente = datos_base['cliente']

    response = api_client.post('/api/pedidos/', {
        'cliente': cliente.id,
        'detalles': [{'libro': libro.id, 'cantidad': 100}],
    }, format='json')

    assert response.status_code == 400
    libro.refresh_from_db()
    assert libro.stock == 10


@pytest.mark.django_db
def test_borrar_pedido_devuelve_stock(api_client, usuario_admin, datos_base):
    """Al borrar un pedido, el stock vuelve al libro."""
    api_client.force_authenticate(user=usuario_admin)
    libro = datos_base['libro']
    cliente = datos_base['cliente']

    response = api_client.post('/api/pedidos/', {
        'cliente': cliente.id,
        'detalles': [{'libro': libro.id, 'cantidad': 2}],
    }, format='json')
    pedido_id = response.json()['id']

    libro.refresh_from_db()
    assert libro.stock == 8

    response = api_client.delete(f'/api/pedidos/{pedido_id}/')
    assert response.status_code == 204

    libro.refresh_from_db()
    assert libro.stock == 10