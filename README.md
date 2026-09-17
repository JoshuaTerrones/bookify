# Bookify

Catálogo de libros full-stack con autenticación y panel de administración propio. Backend en Django + PostgreSQL, frontend en Next.js + TypeScript + Tailwind, todo containerizado con Docker. Los datos de libros son reales, obtenidos automáticamente desde la API de Open Library.

## Stack

**Backend:** Python, Django, Django REST Framework, PostgreSQL, django-cors-headers
**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
**Infraestructura:** Docker, Docker Compose

## Qué hace el proyecto

- Muestra un catálogo público de libros con portadas, precios y stock, poblado automáticamente desde Open Library
- Permite buscar por título/autor y ordenar por autor, precio o fecha
- Al hacer click en un libro, muestra un modal con su descripción real (obtenida en vivo desde Open Library)
- Tiene un panel de administración propio (construido en React, no el admin de Django) protegido por login, donde se pueden crear, editar y borrar libros
- Toda la app corre en contenedores Docker: base de datos, backend y frontend se levantan juntos con un solo comando

## Modelos de datos

- **Libro** — título, autor, precio, stock, portada, referencia a Open Library
- **Cliente** — nombre, email
- **Pedido** — relacionado a un cliente
- **DetallePedido** — relaciona pedidos con libros y cantidades

## Cómo correrlo

### Opción A: con Docker (recomendado, todo en un comando)

Requiere tener Docker y Docker Compose instalados.

\`\`\`bash
docker-compose up --build
\`\`\`

Esto levanta automáticamente:
- PostgreSQL (base de datos)
- Backend Django, con migraciones aplicadas, un usuario admin creado y libros de ejemplo poblados
- Frontend Next.js

**Cómo acceder:**

| Qué | URL | Notas |
|---|---|---|
| **Catálogo público** | http://localhost:3000 | Página principal, sin login |
| **Panel de administración** | http://localhost:3000/admin | Requiere login |
| **Login** | http://localhost:3000/login | Usuario: `root` — Contraseña: `root` |
| **API REST** | http://localhost:8000/api/libros/ | Devuelve JSON directo |
| **Admin nativo de Django** | http://localhost:8000/admin/ | Panel genérico de Django, mismo usuario |

Para detener todo:
\`\`\`bash
docker-compose down
\`\`\`

### Opción B: sin Docker (backend y frontend por separado)

**Backend:**
\`\`\`bash
pip install -r requirements.txt
python manage.py migrate
python manage.py poblar_libros
python manage.py runserver
\`\`\`

**Frontend** (en otra terminal):
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Requiere PostgreSQL corriendo localmente y configurado en `settings.py`.

## Flujo de la app

1. **Cualquier visitante** entra a `/` y navega el catálogo público — sin necesidad de cuenta
2. Al hacer click en un libro, se abre un modal con más detalle, incluida su descripción real
3. Para **administrar** el catálogo (agregar, editar o borrar libros), hay que ir a `/admin`, que redirige a `/login` si no hay sesión activa
4. Una vez logueado, el panel de administración permite el CRUD completo de libros desde una interfaz propia en React, sin depender del admin de Django
5. Desde el admin también se puede volver al catálogo público o cerrar sesión

## Próximos pasos

- CRUD de Cliente/Pedido en la interfaz propia
- Deploy a producción (Vercel + Railway/Render)

## Qué practiqué con este proyecto

- Modelado de datos relacional (ForeignKey, migraciones)
- Consumo de APIs externas desde el backend (Open Library)
- Construcción de una API REST propia con Django REST Framework
- Autenticación por sesión y protección de rutas en frontend y backend
- Manejo de CORS entre frontend y backend en desarrollo
- Diseño responsive real (mobile-first en el modal y grid)
- Containerización de una app full-stack completa con Docker Compose, incluyendo arranque automatizado (migraciones, usuario admin y datos de ejemplo) y comunicación entre contenedores