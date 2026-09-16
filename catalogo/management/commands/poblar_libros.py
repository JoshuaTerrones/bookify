import requests
import random
from django.core.management.base import BaseCommand
from catalogo.models import Libro

class Command(BaseCommand):
    help = 'Pobla la base de datos con libros reales desde Open Library'

    def handle(self, *args, **kwargs):
        url = 'https://openlibrary.org/subjects/science_fiction.json?limit=20'
        response = requests.get(url)
        data = response.json()

        creados = 0
        for work in data.get('works', []):
            titulo = work.get('title', 'Sin título')
            autores = work.get('authors', [])
            autor = autores[0]['name'] if autores else 'Autor desconocido'
            cover_id = work.get('cover_id')
            obra_key = work.get('key')

            portada_url = f'https://covers.openlibrary.org/b/id/{cover_id}-M.jpg' if cover_id else None

            precio_random = round(random.uniform(19.90, 79.90), 2)
            stock_random = random.randint(0, 30)

            libro, created = Libro.objects.get_or_create(
                titulo=titulo,
                autor=autor,
                defaults={
                    'precio': precio_random,
                    'stock': stock_random,
                    'portada_url': portada_url,
                    'obra_key' : obra_key
                }
            )
            if created:
                creados += 1

        self.stdout.write(self.style.SUCCESS(f'{creados} libros creados exitosamente'))