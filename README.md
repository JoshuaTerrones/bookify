# 📚 Bookify

![Tests](https://github.com/JoshuaTerrones/bookify/actions/workflows/tests.yml/badge.svg)

**Sistema de gestión de biblioteca full-stack con autenticación, roles de usuario, dashboard de estadísticas y API REST.**

---

## 🚀 Quick overview

Bookify es una aplicación full-stack de gestión de biblioteca con:

- **449 libros reales** cargados desde la API de Open Library
- **Panel de administración propio** (no el de Django) con 5 pestañas: Dashboard, Libros, Clientes, Pedidos, Usuarios
- **Sistema de roles** con permisos diferenciados: admin, editor y lector
- **Dashboard de estadísticas** con gráficos (Recharts)
- **Exportación a CSV y PDF** de libros, clientes y pedidos
- **19 tests automatizados** + CI/CD con GitHub Actions
- **Desplegado en producción** (Vercel + Render + Neon)

| 🎯 Demo | 🛠️ Stack |
|:---:|:---:|
| [bookify-blond-two.vercel.app](https://bookify-blond-two.vercel.app) | Django · Next.js · Docker · PostgreSQL |

**Credenciales de prueba:** usuario `root` — contraseña `root`.

---

## 🌐 Demo en producción

| Servicio | URL |
|:---|:---|
| **Frontend (Vercel)** | https://bookify-blond-two.vercel.app |
| **Backend API (Render)** | https://bookify-zryf.onrender.com |
| **Admin Django** | https://bookify-zryf.onrender.com/admin/ |
| **Repositorio** | https://github.com/JoshuaTerrones/bookify |

---

## 📸 Capturas

| Catálogo público | Panel de administración |
|:---:|:---:|
| ![Catálogo](docs/catalogo.png) | ![Panel admin](docs/sd.png) |

| Modal de detalles | Login |
|:---:|:---:|
| ![Modal](docs/modal.png) | ![Login](docs/login.png) |

---

## ✨ Características

### Catálogo público
- 449 libros reales obtenidos desde la API de Open Library.
- Búsqueda por título o autor en tiempo real.
- Ordenamiento por autor (A-Z), precio (menor a mayor) y fecha (más reciente).
- Filtros avanzados: rango de precio, autor específico y disponibilidad de stock.
- Paginación de 12 libros por página.
- Modal de detalles con descripción en vivo desde Open Library.
- Diseño responsive optimizado para móvil, tablet y desktop.
- Animaciones suaves (fade-in, slide-up, scale-in).

### Panel de administración
- CRUD completo de Libros, Clientes y Pedidos desde una interfaz propia en React.
- Pedidos con items anidados: cada pedido puede tener varios libros con cantidades.
- Validación de stock: no se puede pedir más cantidad de la disponible.
- Descuento y devolución automática de stock al crear, editar o borrar pedidos.
- **Dashboard de estadísticas** con gráficos (Recharts): resumen general, top 5 libros más vendidos y top 5 clientes con más pedidos.
- Pestaña de Usuarios para crear usuarios y asignarles rol.
- Filtros y búsqueda en cada pestaña.
- Paginación de 15 items por página.
- Exportación a CSV y PDF de libros, clientes y pedidos.
- Feedback visual con toasts en cada acción.

### Roles de usuario

| Rol | Ver | Crear | Editar | Borrar | Usuarios |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **editor** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **lector** | ✅ | ❌ | ❌ | ❌ | ❌ |

La UI se adapta al rol: el editor no ve los botones de borrar, y el lector solo puede consultar.

### Seguridad
- Autenticación por sesión de Django con cookies.
- Permisos por grupo respetados tanto en backend como en frontend.
- Variables sensibles (SECRET_KEY, credenciales de DB) en variables de entorno.
- CORS configurado para producción.
- SSL obligatorio en la conexión a PostgreSQL de producción.

### Infraestructura
- Containerización total: todo el stack se levanta con un solo comando.
- CI/CD: tests automáticos con GitHub Actions en cada push.
- Keep-alive: el backend se mantiene despierto con UptimeRobot.
- Imagen Docker pública en GitHub Container Registry.

---

## 🛠️ Stack

**Backend**
- Python 3.14 · Django 6.1 · Django REST Framework 3.18
- PostgreSQL 16 · django-cors-headers
- Whitenoise (archivos estáticos) · Gunicorn (servidor de producción)
- ReportLab (exportación a PDF)

**Frontend**
- Next.js 16 (App Router) · React 19 · TypeScript 5
- Tailwind CSS 4 · Recharts 3 (gráficos)
- Turbopack (bundler)

**Infraestructura**
- Docker · Docker Compose (desarrollo local)
- Vercel (frontend) · Render (backend) · Neon (base de datos)
- UptimeRobot (keep-alive)

**Testing**
- pytest · pytest-django (backend, 10 tests)
- Jest · Testing Library (frontend, 3 tests)

**Herramientas de desarrollo**
- GitHub CLI (gh) · Git · Figma

---

## 🚀 Cómo levantar el proyecto en local

### Requisitos

- Docker y Docker Compose instalados.
- Puertos 3000 (frontend) y 8000 (backend) libres.

### Pasos

1. Clona el repositorio:

```bash
git clone https://github.com/JoshuaTerrones/bookify.git
cd bookify
```

2. Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Levanta todo con Docker:

```bash
docker-compose up --build
```

Docker se encarga de:

1. Levantar PostgreSQL 16.
2. Aplicar migraciones.
3. Crear los grupos de permisos (admin, editor, lector).
4. Crear el superusuario root.
5. Poblar la base de datos con libros desde Open Library (solo si está vacía).
6. Iniciar el backend con Gunicorn y el frontend con Next.js.

La primera vez tarda unos minutos porque descarga imágenes y dependencias. Las siguientes veces es casi instantáneo.

---

## 🌐 Cómo acceder

### Local

| Qué | URL | Notas |
|:---|:---|:---|
| Catálogo público | http://localhost:3000 | Sin login |
| Panel de administración | http://localhost:3000/admin | Requiere login |
| Login | http://localhost:3000/login | Usuario: root — Contraseña: root |
| API REST | http://localhost:8000/api/libros/ | Devuelve JSON |
| Admin nativo de Django | http://localhost:8000/admin/ | Panel genérico de Django |

**Para detener todo:**

```bash
docker-compose down
```

### Producción

Ver la sección [Demo en producción](#-demo-en-producción).

---

## 🗺️ Rutas de la API

Todas las rutas están bajo el prefijo `/api/`. La autenticación se maneja con sesiones de Django.

### Libros

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/libros/ | Lista todos los libros | Público |
| POST | /api/libros/ | Crea un libro | Autenticado + permiso |
| GET | /api/libros/{id}/ | Obtiene un libro | Público |
| PUT | /api/libros/{id}/ | Actualiza un libro | Autenticado + permiso |
| PATCH | /api/libros/{id}/ | Actualiza parcialmente | Autenticado + permiso |
| DELETE | /api/libros/{id}/ | Elimina un libro | Autenticado + permiso |

### Clientes

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/clientes/ | Lista clientes | Autenticado |
| POST | /api/clientes/ | Crea un cliente | Autenticado + permiso |
| PUT | /api/clientes/{id}/ | Actualiza un cliente | Autenticado + permiso |
| DELETE | /api/clientes/{id}/ | Elimina un cliente | Autenticado + permiso |

### Pedidos

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/pedidos/ | Lista pedidos con detalles | Público |
| POST | /api/pedidos/ | Crea un pedido con items | Autenticado + permiso |
| PUT | /api/pedidos/{id}/ | Actualiza pedido y detalles | Autenticado + permiso |
| DELETE | /api/pedidos/{id}/ | Elimina y devuelve stock | Autenticado + permiso |

### Usuarios

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/usuarios/ | Lista usuarios con su rol | Solo admin |
| POST | /api/usuarios/ | Crea un usuario | Solo admin |
| PUT | /api/usuarios/{id}/ | Actualiza usuario y rol | Solo admin |
| DELETE | /api/usuarios/{id}/ | Elimina un usuario | Solo admin |

### Estadísticas

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/estadisticas/ | Resumen + gráficos | Solo admin |

### Exportación

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| GET | /api/exportar/{recurso}/csv/ | Descarga CSV | Autenticado |
| GET | /api/exportar/{recurso}/pdf/ | Descarga PDF | Autenticado |

Donde `{recurso}` es `libros`, `clientes` o `pedidos`.

### Autenticación

| Método | Ruta | Descripción | Permisos |
|:---|:---|:---|:---|
| POST | /api/login/ | Inicia sesión | Público |
| POST | /api/logout/ | Cierra la sesión | Autenticado |
| GET | /api/me/ | Devuelve autenticación + rol | Público |

---

## 🖥️ Rutas del Frontend

| Ruta | Descripción |
|:---|:---|
| / | Catálogo público. No requiere login. |
| /login | Inicio de sesión. |
| /admin | Panel de administración. Redirige a /login si no hay sesión. |

---

## 🧪 Tests

### Backend (pytest)

```bash
docker-compose exec web python -m pytest catalogo/tests/ -v
```

**19 tests pasando:**

- **test_libros.py (3 tests):** listado público, protección sin login, creación autenticada.
- **test_clientes.py (4 tests):** acceso restringido, creación, validación de email único.
- **test_pedidos.py (3 tests):** descuento de stock, validación de stock insuficiente, devolución al borrar.
- **test_roles.py (9 tests):** permisos por rol para admin, editor, lector y anónimo.

### Frontend (Jest)

```bash
cd frontend
npm test
```

**3 tests pasando:** renderizado de formulario, botones, callback de cancelar.

### CI/CD

Los tests corren automáticamente en cada push a main mediante GitHub Actions:

- Job 1: Backend (pytest) en Ubuntu con PostgreSQL 16.
- Job 2: Frontend (Jest) en Ubuntu con Node 20.

Ver el badge arriba del README para el estado actual.

---

## 🐳 Docker: el proceso completo

Esta fue una de las partes más complejas del proyecto. No solo era levantar los contenedores, sino asegurar que al arrancar se ejecutaran todos los comandos necesarios en el orden correcto y que el frontend estuviera disponible cuando el backend ya estuviera listo.

### docker-compose.yml

Define tres servicios: db, web y frontend.

**db:** PostgreSQL 16 con un healthcheck para garantizar que la base de datos esté lista antes de que el backend intente conectarse.

**web:** el backend. El comando de arranque ejecuta `python manage.py bootstrap`, que internamente hace:

1. migrate — aplica las migraciones.
2. crear_grupos — crea los grupos admin, editor y lector con sus permisos.
3. crear_admin — crea el superusuario root y lo asigna al grupo admin.
4. poblar_libros — puebla con 449 libros de Open Library solo si la base de datos está vacía.
5. runserver — inicia el servidor de desarrollo.

**frontend:** Next.js en modo desarrollo. Depende de web.

### Producción (Render)

En producción, el backend usa `entrypoint.sh` en lugar de docker-compose:

1. Aplica migraciones.
2. Crea grupos y admin.
3. Recolecta archivos estáticos (collectstatic).
4. Puebla libros solo si la base de datos está vacía.
5. Arranca gunicorn con 2 workers.

### Dockerfile

```dockerfile
FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]
```

### Por qué funciona

El encadenamiento con && y el healthcheck garantizan un flujo determinista. Cuando ves el contenedor corriendo, sabes que todo está en su sitio.

---

## 🗄️ Modelos de datos

Definidos en la app catalogo:

- **Libro** — título, autor, precio, stock, URL de portada, referencia a Open Library.
- **Cliente** — nombre, email único.
- **Pedido** — relación con Cliente, fecha de creación.
- **DetallePedido** — relación entre Pedido y Libro, con cantidad.

**Lógica de negocio:**

- Al crear un pedido, se valida que hay stock suficiente para cada item.
- Se descuenta el stock al confirmar el pedido.
- Al editar un pedido, se devuelve el stock de los items anteriores y se descuenta el nuevo.
- Al borrar un pedido, se devuelve todo el stock.

---

## 📂 Estructura del proyecto

```
bookify/
├── .github/workflows/       # CI/CD
│   ├── tests.yml            # Tests automatizados
│   └── publish-docker.yml   # Publica imagen Docker en GHCR
├── bookify/                 # Configuración Django
│   ├── settings.py          # Lee variables de entorno
│   ├── urls.py
│   └── wsgi.py
├── catalogo/                # App principal
│   ├── models.py
│   ├── serializers.py
│   ├── views.py             # ViewSets + permisos + estadísticas + exportación
│   ├── urls.py
│   ├── authentication.py    # CsrfExemptSessionAuthentication
│   ├── admin.py
│   ├── management/commands/ # crear_grupos, crear_admin, poblar_libros, bootstrap
│   └── tests/               # tests de libros, clientes, pedidos, roles
├── frontend/                # Aplicación Next.js
│   ├── app/
│   │   ├── page.tsx         # Catálogo público
│   │   ├── admin/page.tsx   # Panel de administración (5 tabs)
│   │   ├── login/page.tsx
│   │   ├── api/             # API Routes (proxy al backend)
│   │   └── components/      # Toast, Pagination, Forms, Dashboard
│   └── __tests__/           # Tests Jest
├── docs/                    # Capturas de pantalla
├── Dockerfile
├── entrypoint.sh            # Arranque de producción
├── docker-compose.yml
├── pytest.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🐛 Problemas encontrados y cómo los resolví

Esta sección documenta los problemas reales que aparecieron durante el desarrollo. No todo fue lineal.

### Deploy y producción

**1. Render rechazaba todas las peticiones con 400**

Todos los endpoints devolvían 400 después del primer deploy. La variable `ALLOWED_HOSTS` apuntaba a `bookify-api.onrender.com`, pero la URL real era `bookify-zryf.onrender.com`. Django rechaza peticiones cuyo host no esté en la lista. Corregí la variable con el dominio real de Render. **Lección:** verificar siempre el dominio real que asigna el proveedor.

**2. El backend se dormía cada 15 minutos (spin-down de Render free)**

El plan gratuito de Render apaga el servicio tras 15 minutos de inactividad. La primera visita después tardaba 50 segundos. Usé **UptimeRobot** para pingear el backend cada 5 minutos. Resultado: nunca se duerme, la primera visita carga al instante.

**3. Whitenoise no encontraba los archivos estáticos**

El admin de Django en producción cargaba sin estilos (`No directory at: /app/staticfiles/`). Whitenoise necesita que los archivos estén recolectados en `STATIC_ROOT`. Añadí `collectstatic` al `entrypoint.sh`.

**4. Conexión SSL a Neon**

Neon exige SSL en conexiones PostgreSQL. Añadí `OPTIONS: { sslmode: 'prefer' }` configurable por variable de entorno. En local usa `prefer`, en producción usa `require`.

**5. `.env` subido a GitHub por accidente**

El archivo `.env` con el `SECRET_KEY` quedó en el repo público. Añadí `.env` al `.gitignore`, ejecuté `git rm --cached .env`, y **regeneré el SECRET_KEY** con `get_random_secret_key()`.

### Backend

**6. El backend devolvía 401 al listar clientes**

El test detectó que `/api/clientes/` devolvía 200 sin autenticación. Corregí el `ClienteViewSet` para requerir login. Pero entonces el frontend fallaba con `clientes.map is not a function`. **Causa:** el GET del frontend no enviaba la cookie de sesión, así que Django devolvía un objeto de error, no un array. **Solución:** actualizar los `route.ts` para enviar la cookie.

**7. Hook de React mal ordenado**

Error `Rendered more hooks than during the previous render` en el panel admin. Un `useMemo` estaba después de un `return` condicional. **Solución:** moverlo antes del return temprano. **Lección:** todos los hooks van al inicio del componente.

**8. Superuser con grupo lector**

Un usuario llamado `lector` podía acceder a `/api/estadisticas/` (solo admin) porque tenía `is_superuser=True`. Los superusers ignoran los permisos de grupo. **Solución:** `u.is_superuser = False` desde el shell. **Lección:** solo root debe ser superuser.

**9. Estilos del admin rotos por permisos personalizados**

Después de implementar `DjangoModelPermissionsOrReadOnly`, el catálogo público devolvía 403 en libros. La clase padre exige autenticación **incluso para GET**. **Solución:** crear `ReadOnlyOrDjangoModelPermissions` desde `BasePermission`.

### Frontend

**10. Tests de accesibilidad fallando**

Los tests de `ClienteForm` fallaban con `Unable to find an element with the placeholder text of: Nombre`. Los inputs no tenían `<label>` asociado. **Solución:** añadir `htmlFor` al label e `id` al input, y cambiar `getByPlaceholderText` por `getByLabelText`.

**11. HMR bloqueado en Safari al acceder desde el iPhone**

Next.js bloqueaba el Hot Module Replacement por CORS al abrir desde Safari en el iPhone. **Solución:** añadir la IP local a `allowedDevOrigins` en `next.config.ts` (solo aplica en desarrollo).

**12. Responsive con múltiples problemas**

Al probar en móvil aparecieron varios problemas: header solapado, botones de "Editar"/"Borrar" que dependían de hover (no existe en móvil), paginación muy chica para el dedo, modal muy alto. **Soluciones:** header en `flex-col` en móvil, botones siempre visibles en móvil, paginación con flechas grandes, modal con portada más chica.

**13. Select de libro se salía del card**

En el formulario de pedidos, cuando el nombre del libro era largo, el select empujaba el input y el botón fuera del contenedor. En flexbox los elementos tienen `min-width: auto`, lo que les impide encogerse. **Solución:** `min-w-0` al select y `shrink-0` al input de cantidad y al botón.

### Docker

**14. Docker tardaba 40 segundos en arrancar**

Cada `docker-compose up` ejecutaba `poblar_libros`, que consulta Open Library con pausas de 0.5 segundos. Tardaba 40 segundos y se repetía en cada reinicio. **Solución:** un comando `bootstrap` que verifica si la base de datos está vacía antes de poblar. Arranque de 5 segundos cuando ya hay datos.

**15. Docker `--build` vs `up`**

Tras instalar una dependencia nueva, el contenedor seguía sin reconocerla. `docker-compose up` usa la imagen vieja. **Solución:** usar `docker-compose up --build` cuando cambian `requirements.txt` o `package.json`.

**16. Comando mal copiado generó archivos basura**

Al copiar comandos en la terminal, se generó `requirements.txtdocker-compose` por falta de un salto de línea. **Solución:** `git rm requirements.txtdocker-compose`. **Lección:** copiar comandos uno a uno, no en bloque, cuando tienen `>`.

### Testing

**17. `reportlab` no estaba en el contenedor**

Los imports de `reportlab` aparecían como "Unresolved reference" en PyCharm. Estaba instalado en el venv local pero no en Docker. **Solución:** `docker-compose exec web pip install reportlab` y regenerar `requirements.txt` con `pip freeze`.

**18. Tests de CRUD fallando por permisos**

Después de implementar roles, los tests de CRUD fallaban con 403. Las fixtures creaban usuarios sin grupo. **Solución:** usar `create_superuser` en las fixtures (los superusers ignoran los permisos de grupo). Los tests de roles siguen probando permisos reales.

---

## 🛠️ Herramientas y trucos útiles

### GitHub CLI (gh)

Instalado desde el `.pkg` oficial sin Homebrew. Se usa para:

- Crear issues en masa: `gh issue create -R usuario/repo`
- Cerrar tickets: `gh issue close 11`
- Gestionar el tablero de Projects: `gh project item-add`
- Crear labels: `gh label create`

### Debugging en Docker

```bash
# Ver logs de un servicio específico
docker-compose logs -f web

# Reiniciar solo un servicio
docker-compose restart web

# Ejecutar comandos dentro del contenedor
docker-compose exec web python manage.py shell

# Reconstruir la imagen (cuando cambian dependencias)
docker-compose up --build
```

### Testing en local

```bash
# Backend
docker-compose exec web python -m pytest catalogo/tests/ -v

# Frontend
cd frontend && npm test

# Simulador de móvil en Safari: Cmd + Option + R, elegir iPhone 14 Pro
```

### Deploy rápido

```bash
# Render redesplega automáticamente con cada push a main
git push origin main

# Ver logs de Render en tiempo real: dashboard.render.com → tu servicio → Logs
```

---

## 📊 Lo que construí

- **Backend:** API REST completa con 3 recursos (Libros, Clientes, Pedidos) y 4 roles de usuario.
- **Frontend:** aplicación Next.js con catálogo público, panel admin de 5 pestañas, y sistema de filtros, búsqueda y paginación.
- **Dashboard:** 4 tarjetas de resumen y 3 gráficos con Recharts.
- **Exportación:** CSV y PDF de los 3 recursos.
- **Tests:** 19 tests de backend + 3 de frontend, con cobertura de CRUDs, validaciones, permisos por rol y stock.
- **CI/CD:** workflow de GitHub Actions que corre los tests en cada push.
- **Deploy:** frontend en Vercel, backend en Render, base de datos en Neon, con SSL y CORS configurados.
- **Docker:** imagen publicada en GitHub Container Registry.
- **Documentación:** README con la arquitectura completa y problemas resueltos.

---

## 🧠 Lo que aprendí con este proyecto

- **Modelado de datos relacional:** ForeignKey, migraciones, relaciones entre libros, clientes y pedidos.
- **Consumo de APIs externas:** integración con Open Library desde el backend para obtener datos reales.
- **Construcción de una API REST:** con Django REST Framework, usando ModelViewSet y permisos personalizados.
- **Sistema de roles:** grupos de Django, permisos por acción, y UI adaptada al rol del usuario.
- **Serializers anidados:** creación y actualización de pedidos con sus detalles en una sola petición.
- **Validación de lógica de negocio:** stock disponible al crear y editar pedidos.
- **Autenticación por sesión:** cookies y CSRF, tanto en backend como en frontend.
- **Manejo de CORS:** configuración de django-cors-headers para producción.
- **Docker Compose:** orquestación de múltiples servicios con healthchecks y comandos de inicialización.
- **Comandos custom de Django:** crear_grupos, crear_admin, poblar_libros, bootstrap.
- **Exportación de datos:** CSV con `csv` built-in y PDF con `reportlab`.
- **Gráficos en el frontend:** Recharts para visualizar estadísticas.
- **Tests automatizados:** pytest para el backend, Jest para el frontend.
- **CI/CD:** workflow de GitHub Actions que corre los tests en cada push.
- **Deploy en producción:** variables de entorno, SSL, dominios personalizados, Docker en registry.
- **Resolución de problemas:** cada error fue una oportunidad para entender mejor el stack.

---

## 🔮 Roadmap

El progreso del proyecto y las tareas planificadas se gestionan en un tablero público de GitHub Projects:

👉 **[Ver el roadmap de Bookify](https://github.com/users/JoshuaTerrones/projects/3)**

---

## 👤 Autor

**Joshua Terrones**

- GitHub: [@JoshuaTerrones](https://github.com/JoshuaTerrones)
- LinkedIn: [in/joshuaterrones](https://linkedin.com/in/joshuaterrones)
- Email: terronesjoshua@icloud.com