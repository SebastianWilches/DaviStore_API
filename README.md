# 🛍️ DaviStore - E-commerce Backend API

Backend API para un sistema de e-commerce simplificado construido con Node.js, Express, TypeScript y PostgreSQL.

## 🚀 Características

- ✅ **Autenticación y Autorización** con JWT
- ✅ **CRUD de Productos** con gestión de stock
- ✅ **Sistema de Carrito de Compras** funcional
- ✅ **Gestión de Órdenes** y checkout
- ✅ **Sistema de Pagos** integrado
- ✅ **Validaciones exhaustivas** en todos los endpoints
- ✅ **Arquitectura limpia** siguiendo principios SOLID y DRY
- ✅ **TypeScript** para type-safety
- ✅ **PostgreSQL** como base de datos

## 📋 Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Crear la base de datos**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE davistore_db;

# Ejecutar las migraciones
\i src/database/migrations/001_initial_schema.sql
```

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── config/              # Configuraciones (DB, JWT, etc.)
├── controllers/         # Controladores (capa de presentación)
├── services/           # Lógica de negocio
├── repositories/       # Capa de acceso a datos
├── models/             # Interfaces y tipos de datos
├── middlewares/        # Middlewares (auth, validation, error handling)
├── routes/             # Definición de rutas
├── validators/         # Validaciones de entrada
├── utils/              # Utilidades y helpers
├── database/           # Scripts SQL y migraciones
└── index.ts            # Punto de entrada
```

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas** basada en principios SOLID:

### Capas

1. **Controllers**: Manejan las peticiones HTTP y respuestas
2. **Services**: Contienen la lógica de negocio
3. **Repositories**: Abstracción de la capa de datos
4. **Models**: Definiciones de tipos e interfaces

### Principios Aplicados

#### ✨ SOLID

- **Single Responsibility**: Cada clase/módulo tiene una única responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Interfaces consistentes
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Dependencias hacia abstracciones

#### 🔄 DRY (Don't Repeat Yourself)

- Utilidades reutilizables
- Middleware genéricos
- Validadores parametrizables

#### 🧹 Clean Code

- Nombres descriptivos
- Funciones pequeñas y enfocadas
- Comentarios solo donde añaden valor
- Manejo consistente de errores

## 🗄️ Base de Datos

Ver [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) para el diseño detallado del modelo de datos.

### Entidades Principales (9 Tablas)

- **Roles**: Sistema de roles escalable (en tabla, no ENUM)
- **Users**: Usuarios del sistema (con `role_id`)
- **Categories**: Categorías de productos (jerárquicas)
- **Products**: Catálogo de productos
- **Carts**: Carritos de compra (usuarios autenticados)
- **Cart Items**: Items del carrito (con snapshot de precio)
- **Orders**: Órdenes confirmadas (histórico inmutable)
- **Order Items**: Items de órdenes (con snapshots)
- **Payments**: Registro de pagos (trazabilidad completa)

### 🎯 Sistema de Roles

**Diseño Escalable:** Tabla `roles` en lugar de ENUM

```sql
-- 2 roles iniciales
roles: customer, admin

-- Fácil agregar más roles cuando sea necesario
INSERT INTO roles (name, display_name, description) VALUES
('moderator', 'Moderador', 'Modera contenido y órdenes'),
('vendor', 'Vendedor', 'Gestiona sus propios productos');
```

**Ventajas:**
- ✅ Sin ALTER TYPE (agregar roles = INSERT)
- ✅ Metadatos ricos (display_name, description)
- ✅ Extensible (agregar columnas fácilmente)
- ✅ UI de admin (gestionar roles desde interfaz)

## 📚 API Endpoints

### Autenticación
```
POST   /api/v1/auth/register          - Registro de usuario
POST   /api/v1/auth/login             - Inicio de sesión
POST   /api/v1/auth/refresh-token     - Renovar token
GET    /api/v1/auth/profile           - Obtener perfil
```

### Productos
```
GET    /api/v1/products               - Listar productos
GET    /api/v1/products/:id           - Obtener producto
POST   /api/v1/products               - Crear producto (admin)
PUT    /api/v1/products/:id           - Actualizar producto (admin)
DELETE /api/v1/products/:id           - Eliminar producto (admin)
```

### Carrito
```
GET    /api/v1/cart                   - Obtener carrito
POST   /api/v1/cart/items             - Agregar item
PUT    /api/v1/cart/items/:id         - Actualizar cantidad
DELETE /api/v1/cart/items/:id         - Eliminar item
DELETE /api/v1/cart                   - Vaciar carrito
```

### Órdenes
```
GET    /api/v1/orders                 - Listar órdenes del usuario
GET    /api/v1/orders/:id             - Obtener orden
POST   /api/v1/orders                 - Crear orden (checkout)
PUT    /api/v1/orders/:id/status      - Actualizar estado (admin)
```

### Pagos
```
POST   /api/v1/payments               - Procesar pago
GET    /api/v1/payments/:orderId      - Obtener estado de pago
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# Ejecutar en producción
npm start
```

## 📝 Variables de Entorno

Ver [.env.example](./.env.example) para todas las variables disponibles.

---

## 📚 Documentación Adicional

- 📊 [DATABASE_ER_DIAGRAM.md](./DATABASE_ER_DIAGRAM.md) - Diagrama ER visual
- 🎯 [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Principios SOLID, DRY, Clean Code
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de deployment
- 🛒 [CART_STRATEGIES.md](./CART_STRATEGIES.md) - Estrategias de carrito
- 👥 [ROLES_DESIGN.md](./ROLES_DESIGN.md) - Diseño de roles
- 🔄 [MIGRACIONES.md](./MIGRACIONES.md) - Guía de migraciones
- 📝 [CHANGELOG.md](./CHANGELOG.md) - Historial de cambios

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Autor

Desarrollado como parte de una prueba técnica para demostrar conocimientos en:
- Node.js y Express
- TypeScript
- PostgreSQL
- Arquitectura de software
- Principios SOLID y Clean Code
- Patrones de diseño

