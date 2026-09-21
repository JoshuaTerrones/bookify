#!/bin/sh
set -e

echo "==> Aplicando migraciones..."
python manage.py migrate --noinput

echo "==> Creando usuario admin..."
python manage.py crear_admin

echo "==> Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "==> Verificando si hay libros en la base de datos..."
LIBROS=$(python manage.py shell -c "from catalogo.models import Libro; print(Libro.objects.count())" 2>/dev/null | tail -1)

if [ "$LIBROS" = "0" ]; then
    echo "==> Base de datos vacía. Poblando con libros de Open Library..."
    python manage.py poblar_libros
else
    echo "==> Ya hay $LIBROS libros en la base de datos. Saltando poblar_libros."
fi

echo "==> Iniciando servidor..."
exec gunicorn bookify.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60