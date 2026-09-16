# Bookify

CRUD de gestión de librería construido con Django y PostgreSQL, como proyecto de aprendizaje backend.

## Stack
- Python 3.14
- Django 6.1
- PostgreSQL
- DataGrip (administración de base de datos)

## Modelos
- **Libro** — título, autor, precio, stock
- **Cliente** — nombre, email
- **Pedido** — relacionado a un cliente
- **DetallePedido** — relaciona pedidos con libros y cantidades

## Funcionalidad actual
- CRUD completo vía Django Admin
- Relaciones entre modelos (ForeignKey) probadas con queries SQL (JOIN)

## Próximos pasos
- API REST con Django REST Framework
- Conexión con frontend en React/Next.js
- Containerización con Docker

## Cómo correrlo localmente
\`\`\`bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
\`\`\`