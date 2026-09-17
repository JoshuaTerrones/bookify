# Bookify

Catálogo de libros full-stack con autenticación y panel de administración: backend en Django + PostgreSQL, frontend en Next.js + TypeScript + Tailwind, consumiendo datos reales de la API de Open Library.

## Stack

**Backend:** Python, Django, Django REST Framework, PostgreSQL, django-cors-headers
**Frontend:** Next.js, TypeScript, Tailwind CSS

## Modelos

- **Libro** — título, autor, precio, stock, portada, referencia a Open Library
- **Cliente** — nombre, email
- **Pedido** — relacionado a un cliente
- **DetallePedido** — relaciona pedidos con libros y cantidades

## Funcionalidad

- API REST (`/api/libros/`, `/api/clientes/`) con Django REST Framework
- Población automática de libros reales vía management command que consume la API de Open Library
- Vitrina pública responsive: búsqueda, ordenamiento, modal de detalle con descripción en vivo desde Open Library
- **Autenticación por sesión** — login/logout protegido a nivel backend
- **Panel de administración (`/admin` en el frontend)** protegido por login, con CRUD completo de libros (crear, editar, borrar) construido en React, sin depender del admin de Django
- Diseño mobile-first en toda la interfaz

## Próximos pasos

- Containerización con Docker (Django + PostgreSQL)
- Deploy a producción (Vercel + Railway/Render)
- CRUD de Cliente/Pedido en la interfaz propia

## Cómo correrlo localmente

**Backend:**
\`\`\`bash
pip install -r requirements.txt
python manage.py migrate
python manage.py poblar_libros
python manage.py runserver
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Qué practiqué con este proyecto
- Modelado de datos relacional (ForeignKey, migraciones)
- Consumo de APIs externas desde el backend (Open Library)
- Construcción de una API REST propia con Django REST Framework
- Autenticación por sesión y protección de rutas en frontend y backend
- Manejo de CORS entre frontend y backend en desarrollo
- Diseño responsive real (mobile-first en el modal y grid)