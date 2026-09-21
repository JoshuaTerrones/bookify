from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group


class Command(BaseCommand):
    help = 'Crea un superusuario por defecto si no existe y lo asigna al grupo admin'

    def handle(self, *args, **kwargs):
        # Crear usuario root si no existe
        if not User.objects.filter(username='root').exists():
            user = User.objects.create_superuser('root', 'root@example.com', 'root')
            self.stdout.write(self.style.SUCCESS('Usuario root creado'))
        else:
            user = User.objects.get(username='root')
            self.stdout.write('Usuario root ya existe')

        # Asignar el grupo admin (si existe)
        try:
            grupo_admin = Group.objects.get(name='admin')
            user.groups.add(grupo_admin)
            self.stdout.write(self.style.SUCCESS('Usuario root asignado al grupo "admin"'))
        except Group.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(
                    'Grupo "admin" no existe todavía. '
                    'Corre "python manage.py crear_grupos" primero.'
                )
            )