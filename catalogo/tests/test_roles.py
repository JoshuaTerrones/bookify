import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from catalogo.models import Libro, Cliente


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def crear_grupos_y_usuarios(db):
    """Crea los 3 grupos con permisos y 3 usuarios de prueba."""
    modelos = [Libro, Cliente]
    acciones = {
        'admin': ['add', 'change', 'delete', 'view'],
        'editor': ['add', 'change', 'view'],
        'lector': ['view'],
    }

    usuarios = {}
    for nombre_grupo, perms in acciones.items():
        grupo, _ = Group.objects.get_or_create(name=nombre_grupo)

        for modelo in modelos:
            ct = ContentType.objects.get_for_model(modelo)
            for accion in perms:
                codename = f'{accion}_{modelo.__name__.lower()}'
                try:
                    permiso = Permission.objects.get(codename=codename, content_type=ct)
                    grupo.permissions.add(permiso)
                except Permission.DoesNotExist:
                    pass

        user = User.objects.create_user(
            username=f'{nombre_grupo}_test',
            password='testpass123'
        )
        user.groups.add(grupo)
        usuarios[nombre_grupo] = user

    return usuarios


@pytest.fixture
def libro_ejemplo(db):
    return Libro.objects.create(
        titulo='Libro de Prueba',
        autor='Autor de Prueba',
        precio='25.00',
        stock=10,
    )


# ============================================
# TESTS: LECTURA PÚBLICA
# ============================================

@pytest.mark.django_db
def test_anonimo_puede_leer_libros(api_client, libro_ejemplo):
    """Sin autenticación, se pueden ver los libros."""
    response = api_client.get('/api/libros/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_anonimo_no_puede_crear_libro(api_client):
    """Sin autenticación, no se puede crear un libro."""
    response = api_client.post('/api/libros/', {
        'titulo': 'Test',
        'autor': 'Test',
        'precio': '10.00',
        'stock': 5,
    })
    assert response.status_code in [401, 403]


# ============================================
# TESTS: ROL ADMIN
# ============================================

@pytest.mark.django_db
def test_admin_puede_crear_libro(api_client, crear_grupos_y_usuarios):
    """Admin puede crear un libro."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['admin'])
    response = api_client.post('/api/libros/', {
        'titulo': 'Nuevo Libro',
        'autor': 'Autor',
        'precio': '30.00',
        'stock': 5,
    })
    assert response.status_code == 201


@pytest.mark.django_db
def test_admin_puede_borrar_libro(api_client, crear_grupos_y_usuarios, libro_ejemplo):
    """Admin puede borrar un libro."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['admin'])
    response = api_client.delete(f'/api/libros/{libro_ejemplo.id}/')
    assert response.status_code == 204


# ============================================
# TESTS: ROL EDITOR
# ============================================

@pytest.mark.django_db
def test_editor_puede_crear_libro(api_client, crear_grupos_y_usuarios):
    """Editor puede crear un libro."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['editor'])
    response = api_client.post('/api/libros/', {
        'titulo': 'Libro de Editor',
        'autor': 'Autor',
        'precio': '20.00',
        'stock': 3,
    })
    assert response.status_code == 201


@pytest.mark.django_db
def test_editor_no_puede_borrar_libro(api_client, crear_grupos_y_usuarios, libro_ejemplo):
    """Editor NO puede borrar un libro."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['editor'])
    response = api_client.delete(f'/api/libros/{libro_ejemplo.id}/')
    assert response.status_code == 403
    # Verificar que el libro sigue existiendo
    assert Libro.objects.filter(id=libro_ejemplo.id).exists()


# ============================================
# TESTS: ROL LECTOR
# ============================================

@pytest.mark.django_db
def test_lector_puede_ver_libros(api_client, crear_grupos_y_usuarios, libro_ejemplo):
    """Lector puede ver libros."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['lector'])
    response = api_client.get('/api/libros/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_lector_no_puede_crear_libro(api_client, crear_grupos_y_usuarios):
    """Lector NO puede crear libros."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['lector'])
    response = api_client.post('/api/libros/', {
        'titulo': 'Test',
        'autor': 'Test',
        'precio': '10.00',
        'stock': 5,
    })
    assert response.status_code == 403


@pytest.mark.django_db
def test_lector_no_puede_borrar_libro(api_client, crear_grupos_y_usuarios, libro_ejemplo):
    """Lector NO puede borrar libros."""
    api_client.force_authenticate(user=crear_grupos_y_usuarios['lector'])
    response = api_client.delete(f'/api/libros/{libro_ejemplo.id}/')
    assert response.status_code == 403