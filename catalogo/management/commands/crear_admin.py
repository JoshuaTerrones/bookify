from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Crea un superusuario por defecto si no existe'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='root').exists():
            User.objects.create_superuser('root', 'root@example.com', 'root')
            self.stdout.write(self.style.SUCCESS('Usuario root creado'))
        else:
            self.stdout.write('Usuario root ya existe')