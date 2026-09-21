from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from catalogo.models import Libro, Cliente, Pedido, DetallePedido


class Command(BaseCommand):
    help = 'Crea los grupos admin, editor y lector con sus permisos'

    def handle(self, *args, **kwargs):
        # Definir permisos por grupo
        permisos_por_grupo = {
            'admin': {
                'libro': ['add', 'change', 'delete', 'view'],
                'cliente': ['add', 'change', 'delete', 'view'],
                'pedido': ['add', 'change', 'delete', 'view'],
                'detallepedido': ['add', 'change', 'delete', 'view'],
            },
            'editor': {
                'libro': ['add', 'change', 'view'],
                'cliente': ['add', 'change', 'view'],
                'pedido': ['add', 'view'],
                'detallepedido': ['add', 'view'],
            },
            'lector': {
                'libro': ['view'],
                'cliente': ['view'],
                'pedido': ['view'],
                'detallepedido': ['view'],
            },
        }

        modelos = {
            'libro': Libro,
            'cliente': Cliente,
            'pedido': Pedido,
            'detallepedido': DetallePedido,
        }

        for nombre_grupo, permisos in permisos_por_grupo.items():
            grupo, created = Group.objects.get_or_create(name=nombre_grupo)

            if created:
                self.stdout.write(f'Grupo "{nombre_grupo}" creado')
            else:
                self.stdout.write(f'Grupo "{nombre_grupo}" ya existía')

            # Limpiar permisos actuales y reasignar
            grupo.permissions.clear()

            for nombre_modelo, acciones in permisos.items():
                modelo = modelos[nombre_modelo]
                content_type = ContentType.objects.get_for_model(modelo)

                for accion in acciones:
                    codename = f'{accion}_{nombre_modelo}'
                    try:
                        permiso = Permission.objects.get(
                            codename=codename,
                            content_type=content_type
                        )
                        grupo.permissions.add(permiso)
                    except Permission.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(f'Permiso {codename} no encontrado')
                        )

        self.stdout.write(self.style.SUCCESS('Grupos y permisos configurados correctamente'))