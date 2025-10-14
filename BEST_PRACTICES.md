# 🎯 Mejores Prácticas Aplicadas - DaviStore Backend

Este documento explica detalladamente cómo se aplican los principios de desarrollo de software en el diseño de la base de datos y arquitectura del proyecto.

---

## 📐 Principios SOLID en Base de Datos

### 1. Single Responsibility Principle (SRP) - Principio de Responsabilidad Única

> "Una clase/módulo debe tener una única razón para cambiar"

#### Aplicación en el Diseño

**✅ Tablas con Responsabilidad Única**

```
❌ MAL (Tabla monolítica):
shopping_transactions
├── user_email
├── user_password
├── product_name
├── product_price
├── cart_items
├── order_status
├── payment_info
└── shipping_address
```
**Problemas:**
- Mezcla múltiples conceptos
- Cambios en usuarios afectan órdenes
- Difícil de mantener y escalar

```
✅ BIEN (Responsabilidades separadas):
users          → Solo gestiona información de usuarios
products       → Solo gestiona catálogo
carts          → Solo gestiona carritos temporales
orders         → Solo gestiona pedidos confirmados
payments       → Solo gestiona transacciones
```

**Ejemplo Concreto:**

```sql
-- users: Solo responsable de autenticación y perfil
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100)
    -- NO incluye información de órdenes, pagos, etc.
);

-- orders: Solo responsable de gestionar pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID,  -- Referencia, no duplica datos
    order_number VARCHAR(50),
    status order_status
    -- NO incluye password, email, etc.
);
```

**Beneficios:**
- Cambios en la estructura de usuario no afectan órdenes
- Cada tabla puede optimizarse independientemente
- Testeo más simple y específico
- Mantenimiento más sencillo

---

### 2. Open/Closed Principle (OCP) - Principio Abierto/Cerrado

> "Las entidades deben estar abiertas para extensión pero cerradas para modificación"

#### Aplicación en el Diseño

**✅ Uso de ENUMs Extensibles**

```sql
-- Fácil agregar nuevos estados sin cambiar estructura
CREATE TYPE order_status AS ENUM (
    'pending',      -- Estado inicial
    'processing',   -- En proceso
    'completed',    -- Completado
    'cancelled'     -- Cancelado
    -- Se pueden agregar más: 'shipped', 'returned', 'refunded'
);

-- Fácil agregar nuevos métodos de pago
CREATE TYPE payment_method AS ENUM (
    'credit_card',
    'debit_card',
    'paypal',
    'transfer'
    -- Futuro: 'crypto', 'apple_pay', 'google_pay'
);
```

**✅ Jerarquía de Categorías Extensible**

```sql
-- Estructura que permite extensión infinita sin modificar schema
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    parent_id UUID,  -- Autoreferencia permite N niveles
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id)
);

-- Ejemplos de uso:
-- Nivel 1: Electrónica
-- Nivel 2: Electrónica > Smartphones
-- Nivel 3: Electrónica > Smartphones > Android
-- Nivel 4: Electrónica > Smartphones > Android > Samsung
-- (Sin límite de profundidad)
```

**Beneficios:**
- Nuevos estados/tipos sin ALTER TABLE
- Categorías infinitas sin cambios estructurales
- Sistema escalable sin refactorización

---

### 3. Liskov Substitution Principle (LSP) - Principio de Sustitución de Liskov

> "Los subtipos deben ser sustituibles por sus tipos base"

#### Aplicación en el Diseño

**✅ Consistencia en Patrones**

```sql
-- TODAS las tablas comparten el mismo patrón base
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- ... campos específicos ...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- ... campos específicos ...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Este patrón se repite en TODAS las tablas
```

**✅ Soft Delete Consistente**

```sql
-- Patrón consistente de desactivación (no eliminación física)
users.is_active BOOLEAN
products.is_active BOOLEAN
categories.is_active BOOLEAN

-- Las queries se comportan igual en todas:
SELECT * FROM users WHERE is_active = true;
SELECT * FROM products WHERE is_active = true;
SELECT * FROM categories WHERE is_active = true;
```

**Beneficios:**
- Código reutilizable en capa de aplicación
- Comportamiento predecible
- Funciones genéricas aplicables a cualquier tabla

---

### 4. Interface Segregation Principle (ISP) - Principio de Segregación de Interfaces

> "Los clientes no deben depender de interfaces que no usan"

#### Aplicación en el Diseño

**✅ Separación de Tablas Específicas**

```
❌ MAL (Tabla genérica):
items
├── id
├── item_type (ENUM: 'cart', 'order')
├── cart_id (nullable)
├── order_id (nullable)
├── product_id
├── quantity
├── price_snapshot (nullable)  -- Solo para orders
├── product_name_snapshot (nullable)  -- Solo para orders
└── product_sku_snapshot (nullable)  -- Solo para orders
```

**Problemas:**
- Campos nullables innecesarios
- Lógica condicional compleja
- Consultas menos eficientes

```
✅ BIEN (Tablas específicas):
cart_items
├── id
├── cart_id (NOT NULL)
├── product_id
├── quantity
└── price_at_addition

order_items
├── id
├── order_id (NOT NULL)
├── product_id
├── product_name (snapshot)
├── product_sku (snapshot)
├── quantity
├── unit_price
└── subtotal
```

**Beneficios:**
- Sin campos nullables innecesarios
- Cada tabla tiene solo los campos que necesita
- Queries más simples y eficientes
- Constraints más estrictos

---

### 5. Dependency Inversion Principle (DIP) - Principio de Inversión de Dependencias

> "Depender de abstracciones, no de concreciones"

#### Aplicación en el Diseño

**✅ Foreign Keys como Abstracciones**

```sql
-- Products depende de la abstracción "categoría", no de valores concretos
CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    category_id UUID NOT NULL,  -- Abstracción mediante FK
    CONSTRAINT fk_product_category 
        FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- En lugar de:
-- category_name VARCHAR(100)  -- Valor concreto, acoplamiento fuerte
```

**✅ Desacoplamiento mediante IDs**

```sql
-- Orders guarda referencia, no datos concretos del usuario
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,  -- Referencia abstracta
    -- NO: user_email, user_name, user_phone (datos concretos)
);

-- Datos se obtienen mediante JOIN cuando se necesitan
SELECT o.*, u.email, u.first_name, u.last_name
FROM orders o
INNER JOIN users u ON o.user_id = u.id;
```

**Excepción Justificada: Snapshots**

```sql
-- order_items SÍ guarda datos concretos (inmutabilidad histórica)
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID,
    product_id UUID,  -- Referencia para relación
    product_name VARCHAR(255),  -- Snapshot para histórico
    product_sku VARCHAR(50)  -- Snapshot para histórico
);
```

**Beneficios:**
- Cambios en una entidad no rompen otras
- Normalización reduce duplicación
- Mantenimiento más simple

---

## 🔁 Principio DRY (Don't Repeat Yourself)

> "Cada pieza de conocimiento debe tener una representación única, inequívoca y autoritativa"

### Aplicación en el Diseño

**✅ Normalización para Evitar Duplicación**

```
❌ MAL (Duplicación de datos):
products
├── name: "Laptop ProBook 15"
├── category_name: "Laptops"
├── category_description: "Computadoras portátiles"
└── category_slug: "laptops"

orders
├── user_email: "user@example.com"
├── user_first_name: "Juan"
├── user_last_name: "Pérez"
└── user_phone: "+1234567890"
```

**Problemas:**
- Si cambia la categoría, hay que actualizar todos los productos
- Inconsistencias: diferentes valores para la misma categoría
- Desperdicio de espacio

```
✅ BIEN (Datos centralizados):
products
└── category_id: UUID (FK → categories.id)

categories
├── name: "Laptops"
├── description: "Computadoras portátiles"
└── slug: "laptops"

orders
└── user_id: UUID (FK → users.id)

users
├── email: "user@example.com"
├── first_name: "Juan"
├── last_name: "Pérez"
└── phone: "+1234567890"
```

**✅ Reutilización mediante Triggers**

```sql
-- Función reutilizable para TODAS las tablas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a cada tabla (no repetir lógica)
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Trade-off: Cuándo NO aplicar DRY**

```sql
-- Snapshots en order_items (INTENCIONAL)
CREATE TABLE order_items (
    product_name VARCHAR(255),  -- "Duplicación"
    product_sku VARCHAR(50)     -- "Duplicación"
);
```

**Justificación:**
- **Inmutabilidad**: El histórico no debe cambiar
- **Confiabilidad**: Órdenes antiguas muestran datos correctos
- **Auditoría**: Saber exactamente qué se vendió

**Este es un trade-off consciente y justificado: Inmutabilidad > DRY**

---

## 🧹 Clean Code en Base de Datos

### 1. Nombres Significativos y Consistentes

**✅ Convenciones de Nomenclatura**

```sql
-- Tablas: plural, snake_case
users, products, cart_items, order_items

-- Columnas: singular, snake_case
first_name, last_name, created_at, updated_at

-- Primary Keys: siempre "id"
users.id, products.id

-- Foreign Keys: "[tabla_referenciada]_id"
products.category_id, orders.user_id

-- Booleans: prefijo "is_" o "has_"
is_active, is_verified, has_paid

-- Enums: descriptivos, sin abreviaciones
order_status, payment_method, user_role
```

**❌ Nombres Pobres vs ✅ Nombres Ricos**

```sql
-- ❌ Nombres ambiguos
CREATE TABLE prod (
    i INT,
    n VARCHAR(100),
    p DECIMAL,
    s INT
);

-- ✅ Nombres descriptivos
CREATE TABLE products (
    id UUID,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    stock_quantity INTEGER
);
```

---

### 2. Constraints y Validaciones Explícitas

**✅ Validaciones Auto-Documentadas**

```sql
CREATE TABLE products (
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    
    -- Constraints explícitos con nombres significativos
    CONSTRAINT price_positive_check CHECK (price > 0),
    CONSTRAINT stock_non_negative_check CHECK (stock_quantity >= 0)
);

CREATE TABLE users (
    email VARCHAR(255) NOT NULL,
    
    -- Validación de formato explícita
    CONSTRAINT email_format_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

**Beneficios:**
- Auto-documentación
- Validación en múltiples capas (defensa en profundidad)
- Errores claros y específicos

---

### 3. Comentarios que Añaden Valor

**✅ Comentarios Útiles**

```sql
COMMENT ON TABLE order_items IS 
    'Items de orden con snapshots de producto (histórico inmutable)';

COMMENT ON COLUMN users.password_hash IS 
    'Hash bcrypt de la contraseña (nunca se almacena en texto plano)';

COMMENT ON COLUMN users.is_active IS 
    'Soft delete: false para desactivar usuario sin eliminar datos';

COMMENT ON FUNCTION generate_order_number() IS 
    'Genera número de orden único: ORD-YYYY-000001';
```

**❌ Comentarios Innecesarios**

```sql
-- ❌ Obvio, no añade valor
COMMENT ON COLUMN users.email IS 'El email del usuario';

-- ✅ Añade contexto y valor
COMMENT ON COLUMN cart_items.price_at_addition IS 
    'Snapshot del precio al agregar (inmutabilidad, evita inconsistencias si el precio cambia)';
```

---

### 4. Funciones Pequeñas y Enfocadas

**✅ Funciones con Propósito Único**

```sql
-- Función enfocada: solo genera números de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    order_count INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    sequence_part := LPAD((order_count + 1)::TEXT, 6, '0');
    
    RETURN 'ORD-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;
```

**Características de Clean Code aplicadas:**
- Nombre descriptivo
- Hace una sola cosa
- Variables con nombres significativos
- Lógica clara y secuencial

---

### 5. Manejo de Errores y Defensa en Profundidad

**✅ Múltiples Capas de Validación**

```sql
-- Capa 1: Constraint a nivel de BD
CREATE TABLE products (
    stock_quantity INTEGER CHECK (stock_quantity >= 0)
);

-- Capa 2: Trigger para validaciones complejas
CREATE OR REPLACE FUNCTION validate_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity < 0 THEN
        RAISE EXCEPTION 'Stock no puede ser negativo';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Capa 3: Validación en aplicación (TypeScript)
if (quantity < 0) {
    throw new ValidationError('Stock no puede ser negativo');
}
```

**Beneficios:**
- Protección ante errores de programación
- Mensajes de error claros
- Integridad garantizada

---

## 🏗️ Patrones de Diseño Aplicados

### 1. Snapshot Pattern (Inmutabilidad)

**Problema:** Los precios cambian, pero las órdenes históricas deben reflejar el precio al momento de compra.

**Solución:**

```sql
-- Guardar snapshot del precio al agregar al carrito
CREATE TABLE cart_items (
    product_id UUID,
    price_at_addition DECIMAL(10, 2)  -- Snapshot
);

-- Guardar snapshots completos en órdenes
CREATE TABLE order_items (
    product_id UUID,         -- Relación
    product_name VARCHAR,    -- Snapshot
    product_sku VARCHAR,     -- Snapshot
    unit_price DECIMAL       -- Snapshot
);
```

**Beneficios:**
- Histórico inmutable
- Auditoría confiable
- Reportes precisos

---

### 2. Soft Delete Pattern

**Problema:** Eliminar registros rompe integridad referencial e histórico.

**Solución:**

```sql
-- Marcar como inactivo en lugar de DELETE
CREATE TABLE users (
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE products (
    is_active BOOLEAN DEFAULT true
);

-- Queries filtran por is_active
SELECT * FROM products WHERE is_active = true;
```

**Beneficios:**
- Preserva histórico
- Permite "undelete"
- Mantiene integridad referencial

---

### 3. State Machine Pattern

**Problema:** Estados de orden deben seguir un flujo lógico.

**Solución:**

```sql
CREATE TYPE order_status AS ENUM (
    'pending',      -- Estado inicial
    'processing',   -- Solo desde pending
    'completed',    -- Solo desde processing
    'cancelled'     -- Desde pending o processing
);

-- Flujo válido:
pending → processing → completed
pending → cancelled
processing → cancelled

-- Flujo inválido:
completed → pending (❌)
cancelled → completed (❌)
```

**Implementación en aplicación:**

```typescript
// Transiciones válidas
const VALID_TRANSITIONS = {
    pending: ['processing', 'cancelled'],
    processing: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
};
```

---

## 📊 Índices y Optimización

### Estrategia de Indexación

**✅ Índices en Columnas Frecuentemente Consultadas**

```sql
-- Búsquedas por usuario
CREATE INDEX idx_orders_user ON orders(user_id);

-- Filtros por estado
CREATE INDEX idx_orders_status ON orders(status);

-- Búsquedas combinadas
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

**Trade-off Consciente:**
- ✅ Mejora SELECT (lectura)
- ⚠️ Pequeño impacto en INSERT/UPDATE (escritura)
- 💡 Justificado: E-commerce tiene más lecturas que escrituras

---

## 🎓 Resumen de Mejores Prácticas

### ✅ Checklist de Calidad

- [x] **SRP**: Cada tabla tiene una responsabilidad única
- [x] **OCP**: Extensible sin modificar estructura (ENUMs, jerarquías)
- [x] **LSP**: Patrones consistentes en todas las tablas
- [x] **ISP**: Tablas específicas vs genéricas
- [x] **DIP**: Uso de FK para abstraer relaciones
- [x] **DRY**: Normalización y funciones reutilizables
- [x] **Clean Code**: Nombres significativos y auto-documentación
- [x] **Constraints**: Validaciones explícitas a nivel de BD
- [x] **Índices**: Optimización de consultas frecuentes
- [x] **Soft Delete**: Preservación de histórico
- [x] **Snapshots**: Inmutabilidad de datos críticos
- [x] **Triggers**: Automatización de actualizaciones
- [x] **Comentarios**: Solo donde añaden contexto real

---

## 🚀 Impacto en Calidad del Software

### Mantenibilidad
- Código predecible y fácil de entender
- Cambios localizados, bajo acoplamiento
- Extensible sin refactorización

### Confiabilidad
- Validaciones en múltiples capas
- Integridad referencial garantizada
- Histórico inmutable para auditoría

### Performance
- Índices optimizados
- Desnormalización controlada donde es necesario
- Consultas eficientes

### Escalabilidad
- Diseño extensible
- Separación de concerns
- Preparado para crecimiento

---

Este diseño no solo cumple con los requisitos funcionales, sino que también establece una **base sólida, mantenible y escalable** para el desarrollo del sistema.

