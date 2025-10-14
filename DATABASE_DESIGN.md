# 📊 Diseño de Base de Datos - E-commerce DaviStore

## Modelo Entidad-Relación

### 🎯 Entidades Principales

#### 1. **USERS** (Usuarios)
Almacena la información de usuarios del sistema (clientes y administradores).

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE, NOT NULL)
├── password_hash (VARCHAR, NOT NULL)
├── first_name (VARCHAR, NOT NULL)
├── last_name (VARCHAR, NOT NULL)
├── phone (VARCHAR, NULLABLE)
├── role (ENUM: 'customer', 'admin', DEFAULT: 'customer')
├── is_active (BOOLEAN, DEFAULT: true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **UUID como PK**: Evita exposición de información sensible y escala mejor
- **password_hash**: Nunca almacenamos contraseñas en texto plano (Clean Code - Seguridad)
- **role**: Implementa el principio de segregación de responsabilidades (SOLID - SRP)
- **is_active**: Soft delete pattern, preserva integridad referencial
- **Timestamps**: Auditoría y trazabilidad

---

#### 2. **CATEGORIES** (Categorías)
Organiza productos en categorías jerárquicas.

```sql
categories
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT, NULLABLE)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── parent_id (UUID, FK -> categories.id, NULLABLE)
├── is_active (BOOLEAN, DEFAULT: true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **parent_id**: Permite jerarquía de categorías (extensible sin cambios estructurales - Open/Closed Principle)
- **slug**: SEO-friendly URLs y mejor UX
- **Autoreferencia**: Diseño flexible para subcategorías sin límite de niveles

---

#### 3. **PRODUCTS** (Productos)
Catálogo de productos disponibles.

```sql
products
├── id (UUID, PK)
├── sku (VARCHAR, UNIQUE, NOT NULL)
├── name (VARCHAR, NOT NULL)
├── description (TEXT, NOT NULL)
├── price (DECIMAL(10,2), NOT NULL, CHECK > 0)
├── stock_quantity (INTEGER, NOT NULL, DEFAULT: 0, CHECK >= 0)
├── category_id (UUID, FK -> categories.id, NOT NULL)
├── image_url (VARCHAR, NULLABLE)
├── is_active (BOOLEAN, DEFAULT: true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **SKU**: Identificador único de negocio (Stock Keeping Unit)
- **DECIMAL para precio**: Evita errores de redondeo con flotantes (Clean Code - Precisión)
- **CHECK constraints**: Validación a nivel de BD (defensa en profundidad)
- **stock_quantity**: Gestión de inventario en tiempo real
- **category_id**: Normalización (3NF), evita duplicación de datos (DRY)

---

#### 4. **CARTS** (Carritos de Compra)
Carritos temporales de usuarios.

```sql
carts
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, UNIQUE, NOT NULL)
├── status (ENUM: 'active', 'completed', 'abandoned', DEFAULT: 'active')
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **user_id UNIQUE**: Un usuario solo puede tener un carrito activo (regla de negocio)
- **status**: Permite análisis de carritos abandonados (Business Intelligence)
- **Separación de concerns**: Carrito != Orden (Single Responsibility)

---

#### 5. **CART_ITEMS** (Items del Carrito)
Productos agregados al carrito.

```sql
cart_items
├── id (UUID, PK)
├── cart_id (UUID, FK -> carts.id, NOT NULL, ON DELETE CASCADE)
├── product_id (UUID, FK -> products.id, NOT NULL)
├── quantity (INTEGER, NOT NULL, DEFAULT: 1, CHECK > 0)
├── price_at_addition (DECIMAL(10,2), NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
└── UNIQUE(cart_id, product_id)
```

**Justificación:**
- **price_at_addition**: Snapshot del precio (inmutabilidad, evita inconsistencias)
- **CASCADE DELETE**: Si se elimina carrito, se eliminan items (integridad)
- **UNIQUE constraint**: Evita duplicados, agrupa por producto
- **Normalización**: Tabla intermedia para relación N:M

---

#### 6. **ORDERS** (Órdenes/Pedidos)
Pedidos confirmados por usuarios.

```sql
orders
├── id (UUID, PK)
├── order_number (VARCHAR, UNIQUE, NOT NULL) -- Ej: ORD-2024-0001
├── user_id (UUID, FK -> users.id, NOT NULL)
├── total_amount (DECIMAL(10,2), NOT NULL, CHECK >= 0)
├── status (ENUM: 'pending', 'processing', 'completed', 'cancelled', DEFAULT: 'pending')
├── shipping_address (TEXT, NOT NULL)
├── shipping_city (VARCHAR, NOT NULL)
├── shipping_postal_code (VARCHAR, NOT NULL)
├── shipping_country (VARCHAR, NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **order_number**: Identificador amigable para usuarios (UX)
- **Snapshot de dirección**: Inmutabilidad, preserva datos históricos
- **status**: Máquina de estados para tracking (State Pattern)
- **total_amount**: Desnormalización controlada para performance (trade-off justificado)

---

#### 7. **ORDER_ITEMS** (Items de Orden)
Productos de cada orden (histórico inmutable).

```sql
order_items
├── id (UUID, PK)
├── order_id (UUID, FK -> orders.id, NOT NULL, ON DELETE RESTRICT)
├── product_id (UUID, FK -> products.id, NOT NULL)
├── product_name (VARCHAR, NOT NULL) -- Snapshot
├── product_sku (VARCHAR, NOT NULL) -- Snapshot
├── quantity (INTEGER, NOT NULL, CHECK > 0)
├── unit_price (DECIMAL(10,2), NOT NULL)
├── subtotal (DECIMAL(10,2), NOT NULL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **Snapshots de producto**: Histórico inmutable (Clean Code - Inmutabilidad)
- **RESTRICT DELETE**: No se pueden eliminar órdenes con items (integridad)
- **subtotal**: Desnormalización para performance en reportes
- **Preserva información**: Incluso si el producto se elimina del catálogo

---

#### 8. **PAYMENTS** (Pagos)
Registro de transacciones de pago.

```sql
payments
├── id (UUID, PK)
├── order_id (UUID, FK -> orders.id, UNIQUE, NOT NULL)
├── payment_method (ENUM: 'credit_card', 'debit_card', 'paypal', 'transfer')
├── amount (DECIMAL(10,2), NOT NULL)
├── status (ENUM: 'pending', 'approved', 'rejected', 'refunded', DEFAULT: 'pending')
├── transaction_id (VARCHAR, UNIQUE, NULLABLE) -- ID del proveedor de pago
├── payment_date (TIMESTAMP, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Justificación:**
- **order_id UNIQUE**: Una orden tiene un pago principal
- **transaction_id**: Trazabilidad con proveedores externos
- **status independiente**: Separación de concerns (orden vs pago)
- **Extensible**: Fácil agregar nuevos métodos de pago (Open/Closed Principle)

---

## 🔗 Relaciones

```
USERS 1:1 CARTS (Un usuario tiene un carrito activo)
USERS 1:N ORDERS (Un usuario puede tener múltiples órdenes)

CATEGORIES 1:N PRODUCTS (Una categoría tiene muchos productos)
CATEGORIES 1:N CATEGORIES (Autoreferencia para jerarquía)

PRODUCTS 1:N CART_ITEMS (Un producto puede estar en múltiples carritos)
PRODUCTS 1:N ORDER_ITEMS (Un producto puede estar en múltiples órdenes)

CARTS 1:N CART_ITEMS (Un carrito tiene múltiples items)

ORDERS 1:N ORDER_ITEMS (Una orden tiene múltiples items)
ORDERS 1:1 PAYMENTS (Una orden tiene un pago)
```

---

## 📐 Principios Aplicados

### 1. **SOLID**

#### Single Responsibility Principle (SRP)
- Cada tabla tiene una única razón de cambio
- `carts` maneja estado temporal, `orders` maneja pedidos confirmados
- `users` solo gestiona información de usuario, no mezcla con lógica de negocio

#### Open/Closed Principle (OCP)
- Fácil agregar nuevos estados en ENUMs sin cambiar estructura
- Jerarquía de categorías permite extensión sin modificación
- Nuevos métodos de pago se agregan sin refactorizar

#### Liskov Substitution Principle (LSP)
- Todas las entidades comparten patrones comunes (id, timestamps)
- Consistencia en tipos de datos y nomenclatura

#### Interface Segregation Principle (ISP)
- Tablas específicas (cart_items vs order_items) en lugar de una genérica
- Información de pago separada de orden

#### Dependency Inversion Principle (DIP)
- Uso de FK para abstraer relaciones
- Entidades de alto nivel no dependen de detalles de bajo nivel

---

### 2. **DRY (Don't Repeat Yourself)**
- Normalización evita duplicación de datos
- Uso de FK en lugar de duplicar información
- Snapshots solo donde es necesario (inmutabilidad vs DRY trade-off)

---

### 3. **Clean Code**
- Nombres descriptivos y consistentes (snake_case para SQL)
- Constraints explícitos a nivel de BD
- Campos de auditoría en todas las tablas (created_at, updated_at)
- Soft deletes con `is_active` en lugar de DELETE físico

---

### 4. **Patrones de Diseño**

#### Snapshot Pattern
- `price_at_addition` en cart_items
- Información de producto en order_items
- **Justificación**: Histórico inmutable, evita inconsistencias

#### Soft Delete Pattern
- `is_active` en users, products, categories
- **Justificación**: Preserva integridad referencial e histórico

#### State Machine Pattern
- `status` en orders (pending → processing → completed)
- `status` en payments
- **Justificación**: Control de flujo y validaciones

---

## 🔍 Índices Recomendados

```sql
-- Performance en consultas frecuentes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_users_email ON users(email);

-- Índices compuestos para búsquedas complejas
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

---

## 🛡️ Validaciones y Constraints

### A Nivel de Base de Datos
- `CHECK` constraints para valores numéricos positivos
- `UNIQUE` constraints para prevenir duplicados
- `NOT NULL` para campos obligatorios
- `ENUM` types para valores controlados
- Foreign Keys con acciones apropiadas (CASCADE, RESTRICT)

### A Nivel de Aplicación
- Validación de stock disponible antes de agregar al carrito
- Validación de stock antes de confirmar orden
- Validación de formato de email
- Validación de fortaleza de contraseña
- Validación de datos de dirección de envío

---

## 📈 Escalabilidad y Extensibilidad

### Futuras Extensiones Posibles
1. **Tabla de direcciones separada**: Si usuario puede tener múltiples direcciones guardadas
2. **Tabla de reviews/ratings**: Para calificaciones de productos
3. **Tabla de cupones/descuentos**: Sistema de promociones
4. **Tabla de wishlists**: Lista de deseos
5. **Tabla de notificaciones**: Sistema de alertas
6. **Tabla de audit_logs**: Trazabilidad completa de cambios

Este diseño es **sólido, escalable y mantiene las mejores prácticas** de desarrollo.

