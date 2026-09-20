import requests
import random
import time
from django.core.management.base import BaseCommand
from catalogo.models import Libro


class Command(BaseCommand):
    help = 'Pobla la base de datos con libros reales desde Open Library'

    # Sujetos a consultar (variedad de géneros)
    SUJETOS = [
        'science_fiction',
        'fantasy',
        'romance',
        'mystery',
        'history',
        'biography',
        'science',
        'poetry',
        'horror',
        'adventure',
        'thriller',
        'classic_literature',
        'philosophy',
        'psychology',
        'business',
    ]

    # Cuántos libros traer por cada sujeto
    LIMIT_POR_SUJETO = 40

    def handle(self, *args, **kwargs):
        total_creados = 0
        total_revisados = 0

        for sujeto in self.SUJETOS:
            url = f'https://openlibrary.org/subjects/{sujeto}.json?limit={self.LIMIT_POR_SUJETO}'

            try:
                response = requests.get(url, timeout=10)
                if response.status_code != 200:
                    self.stdout.write(self.style.WARNING(f'[{sujeto}] Error HTTP {response.status_code}, saltando...'))
                    continue

                data = response.json()
                works = data.get('works', [])
                self.stdout.write(f'[{sujeto}] {len(works)} libros encontrados')

                for work in works:
                    total_revisados += 1

                    titulo = work.get('title', 'Sin título')
                    autores = work.get('authors', [])
                    autor = autores[0]['name'] if autores else 'Autor desconocido'
                    cover_id = work.get('cover_id')
                    obra_key = work.get('key')

                    # Saltar libros sin portada (se ven feos)
                    if not cover_id:
                        continue

                    portada_url = f'https://covers.openlibrary.org/b/id/{cover_id}-M.jpg'
                    precio_random = round(random.uniform(19.90, 79.90), 2)
                    stock_random = random.randint(0, 30)

                    libro, created = Libro.objects.get_or_create(
                        titulo=titulo,
                        autor=autor,
                        defaults={
                            'precio': precio_random,
                            'stock': stock_random,
                            'portada_url': portada_url,
                            'obra_key': obra_key,
                        }
                    )

                    if created:
                        total_creados += 1

                # Pausa para no saturar la API de Open Library
                time.sleep(0.5)

            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.WARNING(f'[{sujeto}] Error de red: {e}'))
                continue

        self.stdout.write(self.style.SUCCESS(
            f'\n{total_creados} libros creados exitosamente '
            f'(revisados {total_revisados} en total)'
        ))