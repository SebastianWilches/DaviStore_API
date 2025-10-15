# 🛒 DaviStore - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=for-the-badge&logo=postgresql&logoColor=white)

**API RESTful robusta y escalable para comercio electrónico**

[Documentación API](#-api-endpoints) • [Instalación](#-instalación) • [Base de Datos](#-base-de-datos)

</div>

---

## 📋 Descripción del Proyecto

DaviStore Backend es una API RESTful completa desarrollada con Node.js, Express y TypeScript, diseñada para soportar un sistema de comercio electrónico moderno y escalable. Implementa las mejores prácticas de desarrollo, arquitectura limpia y patrones de diseño para garantizar código mantenible y de alta calidad.

La API proporciona todos los endpoints necesarios para gestionar usuarios, productos, categorías, carritos de compra, órdenes y pagos, con un robusto sistema de autenticación basado en JWT y manejo de roles.

---

## ✨ Características

### 🔐 Autenticación y Autorización
- ✅ Registro de usuarios con validación de datos
- ✅ Login con JWT (Access Token + Refresh Token)
- ✅ Refresh token automático
- ✅ Sistema de roles (Customer/Admin)
- ✅ Middleware de autenticación
- ✅ Protección de rutas por rol

### 👥 Gestión de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Perfiles de usuario
- ✅ Activación/Desactivación (soft delete)
- ✅ Filtrado por rol y estado
- ✅ Validación de emails únicos

### 🛍️ Catálogo de Productos
- ✅ CRUD de productos
- ✅ Gestión de stock (establecer, sumar, restar)
- ✅ Búsqueda y filtrado avanzado
- ✅ Ordenamiento por precio/fecha
- ✅ Paginación
- ✅ Productos activos/inactivos
- ✅ Imágenes de productos (URLs)

### 📂 Categorías
- ✅ CRUD de categorías
- ✅ Jerarquía de categorías (parent-child)
- ✅ Slugs únicos para SEO
- ✅ Categorías activas/inactivas

### 🛒 Carrito de Compras
- ✅ Crear/obtener carrito por usuario
- ✅ Agregar items al carrito
- ✅ Actualizar cantidades
- ✅ Eliminar items
- ✅ Vaciar carrito
- ✅ Cálculo automático de totales
- ✅ Snapshot de precios al agregar
- ✅ Reutilización de carritos después de checkout

### 📦 Órdenes
- ✅ Crear órdenes desde el carrito
- ✅ Gestión de estados:
  - pending → processing → shipped → delivered → completed
  - cancelled (en cualquier momento)
- ✅ Números de orden únicos (ORD-2025-000001)
- ✅ Snapshot de datos de envío
- ✅ Snapshot de productos en orden (histórico inmutable)
- ✅ Filtrado por estado y usuario
- ✅ Paginación de órdenes

### 💳 Pagos
- ✅ Registro de transacciones
- ✅ Métodos de pago múltiples
- ✅ Estados de pago (pending, approved, rejected, refunded)
- ✅ Aprobación automática al completar orden
- ✅ IDs de transacción únicos

### 🔒 Seguridad
- ✅ Bcrypt para hash de contraseñas (10 rounds)
- ✅ JWT para autenticación stateless
- ✅ Validación de entrada con express-validator
- ✅ Sanitización de datos
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Helmet para headers de seguridad
- ✅ Prevención de SQL Injection

### 📊 Base de Datos
- ✅ PostgreSQL con TypeScript
- ✅ Migraciones SQL
- ✅ Índices optimizados
- ✅ Triggers para updated_at
- ✅ Constraints y validaciones a nivel DB
- ✅ Transacciones para operaciones críticas
- ✅ Foreign keys con cascadas apropiadas

---

## 📋 Requisitos

### Requisitos del Sistema

- **Node.js**: >= 20.x
- **npm**: >= 9.x
- **PostgreSQL**: >= 14.x
- **Git**: Última versión

### Variables de Entorno Requeridas

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=davistore
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/SebastianWilches/DaviStore_APP.git
cd DaviStore_APP/Backend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus credenciales
nano .env
```

### 4. Configurar Base de Datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE davistore;"

# Ejecutar migraciones
psql -U postgres -d davistore -f src/database/migrations/001_initial_schema.sql
psql -U postgres -d davistore -f src/database/migrations/002_add_order_statuses.sql

# Ejecutar seeds (datos iniciales)
psql -U postgres -d davistore -f src/database/seeds/001_roles.sql
psql -U postgres -d davistore -f src/database/seeds/002_users.sql
psql -U postgres -d davistore -f src/database/seeds/003_categories.sql
psql -U postgres -d davistore -f src/database/seeds/004_products.sql
```

### 5. Compilar TypeScript

```bash
npm run build
```

### 6. Iniciar el Servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🏗️ Estructura del Proyecto

```
Backend/
├── src/
│   ├── config/                      # Configuraciones
│   │   ├── database.ts              # Configuración de PostgreSQL
│   │   └── env.ts                   # Variables de entorno
│   │
│   ├── controllers/                 # Controladores (lógica de rutas)
│   │   ├── AuthController.ts        # Autenticación
│   │   ├── UserController.ts        # Usuarios
│   │   ├── ProductController.ts     # Productos
│   │   ├── CategoryController.ts    # Categorías
│   │   ├── CartController.ts        # Carritos
│   │   └── OrderController.ts       # Órdenes
│   │
│   ├── database/                    # Base de datos
│   │   ├── migrations/              # Migraciones SQL
│   │   │   ├── 001_initial_schema.sql
│   │   │   └── 002_add_order_statuses.sql
│   │   └── seeds/                   # Datos iniciales
│   │       ├── 001_roles.sql
│   │       ├── 002_users.sql
│   │       ├── 003_categories.sql
│   │       └── 004_products.sql
│   │
│   ├── middlewares/                 # Middlewares
│   │   ├── authenticate.ts          # Verificar JWT
│   │   ├── authorize.ts             # Verificar roles
│   │   ├── validate.ts              # Validar datos de entrada
│   │   ├── errorHandler.ts          # Manejo global de errores
│   │   └── notFound.ts              # 404 Handler
│   │
│   ├── models/                      # Modelos/Interfaces
│   │   ├── User.ts                  # Modelo de usuario
│   │   ├── Product.ts               # Modelo de producto
│   │   ├── Category.ts              # Modelo de categoría
│   │   ├── Cart.ts                  # Modelo de carrito
│   │   └── Order.ts                 # Modelo de orden
│   │
│   ├── routes/                      # Definición de rutas
│   │   ├── authRoutes.ts            # Rutas de auth
│   │   ├── userRoutes.ts            # Rutas de usuarios
│   │   ├── productRoutes.ts         # Rutas de productos
│   │   ├── categoryRoutes.ts        # Rutas de categorías
│   │   ├── cartRoutes.ts            # Rutas de carritos
│   │   └── orderRoutes.ts           # Rutas de órdenes
│   │
│   ├── services/                    # Lógica de negocio
│   │   ├── AuthService.ts           # Servicio de autenticación
│   │   ├── UserService.ts           # Servicio de usuarios
│   │   ├── ProductService.ts        # Servicio de productos
│   │   ├── CategoryService.ts       # Servicio de categorías
│   │   ├── CartService.ts           # Servicio de carritos
│   │   └── OrderService.ts          # Servicio de órdenes
│   │
│   ├── types/                       # Tipos TypeScript
│   │   └── index.ts                 # Tipos y enums centralizados
│   │
│   ├── utils/                       # Utilidades
│   │   ├── jwt.ts                   # Funciones JWT
│   │   ├── password.ts              # Hash/compare passwords
│   │   └── responses.ts             # Respuestas estandarizadas
│   │
│   ├── validations/                 # Validaciones con express-validator
│   │   ├── authValidations.ts       # Validaciones de auth
│   │   ├── userValidations.ts       # Validaciones de usuarios
│   │   ├── productValidations.ts    # Validaciones de productos
│   │   ├── categoryValidations.ts   # Validaciones de categorías
│   │   ├── cartValidations.ts       # Validaciones de carritos
│   │   └── orderValidations.ts      # Validaciones de órdenes
│   │
│   ├── app.ts                       # Configuración de Express
│   └── server.ts                    # Punto de entrada
│
├── dist/                            # Código compilado (TypeScript → JavaScript)
├── node_modules/                    # Dependencias
├── IA Documentation/                # Documentación generada por IA
├── .env                             # Variables de entorno (no versionar)
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración de TypeScript
└── README.md                        # Este archivo
```

---

## 🏛️ Arquitectura

### Patrón: **Arquitectura en Capas (Layered Architecture)**

```
┌─────────────────────────────────────────┐
│           CAPA DE RUTAS                 │
│  (Routes) - Define endpoints HTTP       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       CAPA DE CONTROLADORES             │
│  (Controllers) - Maneja request/response│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       CAPA DE SERVICIOS                 │
│  (Services) - Lógica de negocio         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       CAPA DE DATOS                     │
│  (Database) - PostgreSQL + pg           │
└─────────────────────────────────────────┘
```

### Flujo de una Petición

```
1. Cliente → HTTP Request
         ↓
2. Middleware de Autenticación (authenticate)
         ↓
3. Middleware de Autorización (authorize)
         ↓
4. Middleware de Validación (validate)
         ↓
5. Ruta (Route) → define el endpoint
         ↓
6. Controlador (Controller) → extrae datos del req
         ↓
7. Servicio (Service) → lógica de negocio + DB queries
         ↓
8. Base de Datos (PostgreSQL)
         ↓
9. Servicio → retorna datos
         ↓
10. Controlador → formatea respuesta
         ↓
11. Cliente ← HTTP Response (JSON)
```

### Principios de Diseño Aplicados

#### 🎯 SOLID

- **S - Single Responsibility**: Cada clase/función tiene una única responsabilidad
- **O - Open/Closed**: Abierto para extensión, cerrado para modificación
- **L - Liskov Substitution**: Interfaces consistentes
- **I - Interface Segregation**: Interfaces específicas
- **D - Dependency Inversion**: Depender de abstracciones

#### 🧹 Clean Code

- Nombres descriptivos y significativos
- Funciones pequeñas y enfocadas
- DRY (Don't Repeat Yourself)
- Comentarios solo cuando añaden valor
- Manejo explícito de errores

#### 🔒 Seguridad

- **Validación de entrada**: express-validator en todas las rutas
- **Sanitización**: Limpieza de datos de entrada
- **Prepared Statements**: Prevención de SQL Injection (pg con $1, $2...)
- **Hash de contraseñas**: bcrypt con 10 rounds
- **JWT**: Tokens con expiración corta
- **CORS**: Orígenes permitidos configurables
- **Rate Limiting**: Prevención de abuso
- **Helmet**: Headers de seguridad HTTP

---

## 🗄️ Base de Datos

### Diseño de la Base de Datos

La base de datos está diseñada con las siguientes consideraciones:

- **Normalización**: 3FN (Tercera Forma Normal)
- **Integridad Referencial**: Foreign keys con constraints
- **Índices**: Optimización de queries frecuentes
- **Triggers**: Actualización automática de `updated_at`
- **Enums**: Para estados y tipos predefinidos
- **UUIDs**: Identificadores únicos universales
- **Timestamps**: Auditoría de creación y modificación

### Diagrama ER (Entity-Relationship)

```mermaid
erDiagram
    roles ||--o{ users : has
    users ||--o{ carts : owns
    users ||--o{ orders : places
    categories ||--o{ categories : "parent of"
    categories ||--o{ products : contains
    products ||--o{ cart_items : "included in"
    products ||--o{ order_items : "included in"
    carts ||--|{ cart_items : contains
    orders ||--|{ order_items : contains
    orders ||--|| payments : "paid by"

    roles {
        uuid id PK
        varchar name UK
        varchar display_name
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone
        uuid role_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    categories {
        uuid id PK
        varchar name UK
        text description
        varchar slug UK
        uuid parent_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    products {
        uuid id PK
        varchar sku UK
        varchar name
        text description
        decimal price
        integer stock_quantity
        uuid category_id FK
        varchar image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    carts {
        uuid id PK
        uuid user_id FK_UK
        cart_status status
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        integer quantity
        decimal price_at_addition
        timestamp created_at
        timestamp updated_at
    }

    orders {
        uuid id PK
        varchar order_number UK
        uuid user_id FK
        decimal total_amount
        order_status status
        text shipping_address
        varchar shipping_city
        varchar shipping_postal_code
        varchar shipping_country
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        varchar product_name
        varchar product_sku
        integer quantity
        decimal unit_price
        decimal subtotal
        timestamp created_at
        timestamp updated_at
    }

    payments {
        uuid id PK
        uuid order_id FK_UK
        payment_method payment_method
        decimal amount
        payment_status status
        varchar transaction_id UK
        timestamp payment_date
        timestamp created_at
        timestamp updated_at
    }
```

### Tipos ENUM

```sql
-- Estados del carrito
CREATE TYPE cart_status AS ENUM ('active', 'completed', 'abandoned');

-- Estados de orden
CREATE TYPE order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled'
);

-- Métodos de pago
CREATE TYPE payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'paypal',
    'transfer'
);

-- Estados de pago
CREATE TYPE payment_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'refunded'
);
```

### Relaciones Principales

1. **Usuario → Rol**: Many-to-One (varios usuarios pueden tener el mismo rol)
2. **Usuario → Carrito**: One-to-One (un usuario tiene un carrito activo)
3. **Usuario → Órdenes**: One-to-Many (un usuario puede tener múltiples órdenes)
4. **Carrito → Items**: One-to-Many (un carrito tiene múltiples items)
5. **Orden → Items**: One-to-Many (una orden tiene múltiples items)
6. **Orden → Pago**: One-to-One (una orden tiene un pago)
7. **Categoría → Productos**: One-to-Many (una categoría tiene múltiples productos)
8. **Categoría → Subcategorías**: Self-referential (jerarquía)

### Estrategias de Cascada

- **ON DELETE CASCADE**: `carts` → `cart_items` (si se elimina el carrito, se eliminan los items)
- **ON DELETE RESTRICT**: `products` → `cart_items`, `order_items` (no se puede eliminar un producto referenciado)
- **ON DELETE SET NULL**: `categories.parent_id` (si se elimina la categoría padre, se quita la referencia)

---

## 📡 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Formato de Respuesta Estándar

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "message": "Mensaje opcional",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 🔐 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Refrescar access token | Refresh Token |
| GET | `/auth/me` | Obtener usuario actual | JWT |
| POST | `/auth/logout` | Cerrar sesión | JWT |

#### Ejemplo: Register

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+57 300 123 4567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": {
        "name": "customer",
        "display_name": "Cliente"
      }
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 👥 Usuarios

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/users` | Listar usuarios | Admin |
| GET | `/users/:id` | Obtener usuario por ID | JWT |
| PUT | `/users/:id` | Actualizar usuario | JWT |
| DELETE | `/users/:id` | Eliminar usuario | Admin |

**Query Params para GET /users:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `role`: Filtrar por rol (roleId)
- `isActive`: Filtrar por estado (true/false)

### 🛍️ Productos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/products` | Listar productos | No |
| GET | `/products/:id` | Obtener producto por ID | No |
| POST | `/products` | Crear producto | Admin |
| PUT | `/products/:id` | Actualizar producto | Admin |
| DELETE | `/products/:id` | Eliminar producto | Admin |
| PATCH | `/products/:id/stock` | Gestionar stock | Admin |

**Query Params para GET /products:**
- `page`: Número de página
- `limit`: Items por página
- `search`: Búsqueda por nombre/descripción
- `categoryId`: Filtrar por categoría
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo
- `inStock`: Solo productos disponibles (true/false)
- `sortBy`: `price-asc`, `price-desc`, `newest`

**Gestionar Stock:**
```http
PATCH /api/v1/products/:id/stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "operation": "add",      // "set", "add", "subtract"
  "quantity": 50
}
```

### 📂 Categorías

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/categories` | Listar categorías | No |
| GET | `/categories/:id` | Obtener categoría por ID | No |
| POST | `/categories` | Crear categoría | Admin |
| PUT | `/categories/:id` | Actualizar categoría | Admin |
| DELETE | `/categories/:id` | Eliminar categoría | Admin |

### 🛒 Carritos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/cart` | Obtener carrito del usuario | JWT |
| POST | `/cart/items` | Agregar item al carrito | JWT |
| PUT | `/cart/items/:id` | Actualizar cantidad de item | JWT |
| DELETE | `/cart/items/:id` | Eliminar item del carrito | JWT |
| DELETE | `/cart` | Vaciar carrito | JWT |

**Agregar al Carrito:**
```http
POST /api/v1/cart/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "product_id": "uuid",
  "quantity": 2
}
```

### 📦 Órdenes

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/orders` | Listar órdenes | JWT |
| GET | `/orders/:id` | Obtener orden por ID | JWT |
| POST | `/orders` | Crear orden (checkout) | JWT |
| PATCH | `/orders/:id/status` | Actualizar estado | Admin |
| POST | `/orders/:id/cancel` | Cancelar orden | JWT |

**Query Params para GET /orders:**
- `page`: Número de página
- `limit`: Items por página
- `status`: Filtrar por estado
- `userId`: Filtrar por usuario (solo admin)

**Crear Orden (Checkout):**
```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "shipping_address": {
    "address": "Calle 123 #45-67",
    "city": "Bogotá",
    "state": "Cundinamarca",
    "zip": "110111",
    "country": "Colombia"
  },
  "payment_method": "credit_card"
}
```

**Actualizar Estado de Orden:**
```http
PATCH /api/v1/orders/:id/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "status": "shipped"
}
```

### Estados de Orden

Flujo normal:
```
pending → processing → shipped → delivered → completed
```

Cancelación:
```
(cualquier estado) → cancelled
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Herramientas de Testing

- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **Postman**: Colección de endpoints

### Postman Collection

Importa la colección de Postman ubicada en:
```
IA Documentation/POSTMAN_GUIDE.md
```

---

## 🚀 Despliegue

### Preparación para Producción

1. **Build del Proyecto**
   ```bash
   npm run build
   ```

2. **Variables de Entorno**
   - Configurar todas las variables en el servidor
   - Usar secretos seguros para JWT
   - Configurar orígenes CORS correctos

3. **Base de Datos**
   - Ejecutar migraciones en producción
   - Configurar backups automáticos
   - Optimizar índices según carga

### Opciones de Despliegue

#### 🔵 Heroku

```bash
# Instalar Heroku CLI
heroku login

# Crear app
heroku create davistore-api

# Configurar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variables de entorno
heroku config:set JWT_SECRET=tu_secret

# Deploy
git push heroku main
```

#### 🟦 DigitalOcean

1. Crear Droplet con Ubuntu 22.04
2. Instalar Node.js y PostgreSQL
3. Clonar repositorio
4. Configurar PM2 para proceso persistente
5. Configurar Nginx como reverse proxy

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start dist/server.js --name davistore-api

# Guardar configuración
pm2 save
pm2 startup
```

#### 🟩 AWS (EC2 + RDS)

1. Crear instancia EC2
2. Crear base de datos RDS (PostgreSQL)
3. Configurar Security Groups
4. Desplegar con CodeDeploy o manualmente

#### 🐳 Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```bash
# Build
docker build -t davistore-api .

# Run
docker run -p 3000:3000 --env-file .env davistore-api
```

### Monitoreo

- **PM2 Monitoring**: `pm2 monit`
- **Logs**: `pm2 logs davistore-api`
- **Status**: `pm2 status`

---

## 📊 Performance

### Optimizaciones Implementadas

- ✅ **Índices de Base de Datos**: Queries optimizados
- ✅ **Paginación**: Evitar consultas masivas
- ✅ **Prepared Statements**: Reutilización de queries
- ✅ **Connection Pooling**: Pool de conexiones a PostgreSQL
- ✅ **Compresión**: gzip para respuestas HTTP
- ✅ **Caching**: Headers de cache apropiados

### Benchmarks

```bash
# Instalar autocannon
npm install -g autocannon

# Test de carga
autocannon -c 100 -d 10 http://localhost:3000/api/v1/products
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con nodemon (hot-reload)

# Compilación
npm run build            # Compila TypeScript → JavaScript
npm run build:watch      # Compila con watch mode

# Producción
npm start                # Inicia servidor de producción

# Testing
npm test                 # Ejecuta tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con coverage

# Linting
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores de linting automáticamente

# Base de Datos
npm run migrate          # Ejecuta migraciones
npm run seed             # Ejecuta seeds (datos iniciales)
```

---

## 🐛 Troubleshooting

### Error: "database does not exist"

```bash
# Crear la base de datos manualmente
psql -U postgres -c "CREATE DATABASE davistore;"
```

### Error: "relation does not exist"

```bash
# Ejecutar migraciones
psql -U postgres -d davistore -f src/database/migrations/001_initial_schema.sql
```

### Error: "Port 3000 is already in use"

```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: "JWT malformed"

- Verificar que el token se esté enviando correctamente
- Formato: `Authorization: Bearer <token>`

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usar TypeScript con tipos estrictos
- Seguir convenciones de nombres establecidas
- Añadir tests para nuevo código
- Documentar funciones complejas
- Usar commits semánticos




## 👨‍💻 Autor

**Jhoan Sebastian Wilches Jimenez**

- 🔗 LinkedIn: [linkedin.com/in/swilches](https://www.linkedin.com/in/swilches/)
- 🐙 GitHub: [github.com/SebastianWilches](https://github.com/SebastianWilches)
- 📧 Email: sebastianwilches2@gmail.com

---


<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

Desarrollado con ❤️ y ☕ por Jhoan Sebastian Wilches Jimenez

</div>
