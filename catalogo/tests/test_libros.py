import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from catalogo.models import Libro


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
def libro_ejemplo(db):
    return Libro.objects.create(
        titulo='Cien años de soledad',
        autor='Gabriel García Márquez',
        precio='45.00',
        stock=10,
    )


@pytest.mark.django_db
def test_listar_libros_es_publico(api_client, libro_ejemplo):
    """Cualquiera puede ver la lista de libros, sin autenticarse."""
    response = api_client.get('/api/libros/')
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]['titulo'] == 'Cien años de soledad'


@pytest.mark.django_db
def test_crear_libro_sin_auth_falla(api_client):
    """Sin autenticación, no se puede crear un libro."""
    response = api_client.post('/api/libros/', {
        'titulo': 'Test',
        'autor': 'Test',
        'precio': '10.00',
        'stock': 5,
    })
    assert response.status_code in [401, 403]


@pytest.mark.django_db
def test_crear_libro_con_auth_funciona(api_client, usuario_admin):
    """Un usuario autenticado sí puede crear libros."""
    api_client.force_authenticate(user=usuario_admin)
    response = api_client.post('/api/libros/', {
        'titulo': 'El Quijote',
        'autor': 'Cervantes',
        'precio': '30.00',
        'stock': 3,
    })
    assert response.status_code == 201
    assert Libro.objects.count() == 1
    assert Libro.objects.first().titulo == 'El Quijote'