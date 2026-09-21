#!/bin/sh
set -e

echo "==> Ejecutando bootstrap..."
python manage.py bootstrap

echo "==> Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "==> Iniciando servidor..."
exec gunicorn bookify.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60