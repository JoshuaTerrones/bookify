from django.core.management.base import BaseCommand
from django.core.management import call_command
from catalogo.models import Libro


class Command(BaseCommand):
    help = 'Arranque: migra, crea grupos, crea admin, y puebla libros SOLO si la DB está vacía'

    def handle(self, *args, **kwargs):
        self.stdout.write('==> Aplicando migraciones...')
        call_command('migrate', '--noinput')

        self.stdout.write('==> Creando grupos y permisos...')
        call_command('crear_grupos')

        self.stdout.write('==> Creando usuario admin...')
        call_command('crear_admin')

        total_libros = Libro.objects.count()

        if total_libros == 0:
            self.stdout.write(self.style.WARNING(
                '==> Base de datos vacía. Poblando con libros de Open Library...'
            ))
            call_command('poblar_libros')
        else:
            self.stdout.write(self.style.SUCCESS(
                f'==> Ya hay {total_libros} libros en la base de datos. Saltando poblar_libros.'
            ))

        self.stdout.write(self.style.SUCCESS('==> Bootstrap completado'))