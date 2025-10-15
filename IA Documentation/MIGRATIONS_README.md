# 📊 Sistema de Migraciones de Base de Datos

## 🎯 Estrategia de Migraciones

Este proyecto usa **migraciones incrementales** para manejar cambios en la base de datos.

---

## 📁 Estructura de Archivos

```
migrations/
├── 000_reset_database.sql       ⚠️  SOLO DESARROLLO (borra todo)
├── 001_initial_schema.sql       ✅  Schema inicial
├── 002_example_add_user_avatar.sql  ✅  Ejemplo de migración
├── 003_add_product_ratings.sql      ✅  Próxima migración
└── README.md (este archivo)
```

---

## 📝 Nomenclatura

```
[número]_[descripción_breve].sql

Ejemplos:
- 001_initial_schema.sql
- 002_add_user_avatar.sql
- 003_add_product_ratings.sql
- 004_create_reviews_table.sql
- 005_add_wishlist_feature.sql
```

**Reglas:**
- ✅ Número secuencial con 3 dígitos (001, 002, 003...)
- ✅ Descripción en snake_case
- ✅ Verbo en presente (add, create, modify, remove)
- ✅ Específico y descriptivo

---

## 🔄 Flujo de Trabajo

### 1️⃣ Primera Vez (Setup Inicial)

```bash
# Paso 1: Crear la base de datos
psql -U postgres -c "CREATE DATABASE davistore_db;"

# Paso 2: Ejecutar schema inicial
psql -U postgres -d davistore_db -f src/database/migrations/001_initial_schema.sql
```

### 2️⃣ Desarrollo Local (Reset Completo)

**Usar solo cuando necesitas empezar de cero:**

```bash
# Opción A: Dos comandos
psql -U postgres -d davistore_db -f src/database/migrations/000_reset_database.sql
psql -U postgres -d davistore_db -f src/database/migrations/001_initial_schema.sql

# Opción B: Un comando (Windows PowerShell)
Get-Content src/database/migrations/000_reset_database.sql, src/database/migrations/001_initial_schema.sql | psql -U postgres -d davistore_db
```

### 3️⃣ Aplicar Nueva Migración (Desarrollo en Equipo)

```bash
# Solo ejecutar la nueva migración
psql -U postgres -d davistore_db -f src/database/migrations/002_add_user_avatar.sql
```

### 4️⃣ Aplicar Múltiples Migraciones (Actualización)

```bash
# Ejecutar todas las migraciones que faltan (en orden)
psql -U postgres -d davistore_db -f src/database/migrations/002_add_user_avatar.sql
psql -U postgres -d davistore_db -f src/database/migrations/003_add_product_ratings.sql
psql -U postgres -d davistore_db -f src/database/migrations/004_create_reviews_table.sql
```

---

## ✍️ Crear una Nueva Migración

### Template Base

```sql
-- =====================================================
-- MIGRACIÓN 00X: [Descripción del cambio]
-- Fecha: YYYY-MM-DD
-- Autor: [Tu nombre]
-- Descripción: [Explicación detallada]
-- =====================================================

-- =====================================================
-- UP: Aplicar cambios
-- =====================================================

-- Tu código SQL aquí
-- Ejemplo: ALTER TABLE, CREATE TABLE, etc.

-- =====================================================
-- Verificación
-- =====================================================

DO $$
BEGIN
    -- Código de verificación
    RAISE NOTICE '✅ Migración 00X aplicada exitosamente';
END $$;

-- =====================================================
-- DOWN: Revertir cambios (para rollback)
-- =====================================================

-- Comentarios de cómo revertir
-- Ejemplo: DROP TABLE, ALTER TABLE DROP COLUMN, etc.
```

### Ejemplos Prácticos

#### Ejemplo 1: Agregar una columna

```sql
-- UP
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE products
ADD CONSTRAINT discount_valid CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- DOWN (comentado)
-- ALTER TABLE products DROP COLUMN IF EXISTS discount_percentage CASCADE;
```

#### Ejemplo 2: Crear una tabla nueva

```sql
-- UP
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- DOWN (comentado)
-- DROP TABLE IF EXISTS reviews CASCADE;
```

#### Ejemplo 3: Modificar una columna existente

```sql
-- UP
ALTER TABLE products 
ALTER COLUMN description TYPE TEXT;

-- Si necesitas migrar datos
UPDATE products SET description = TRIM(description);

-- DOWN (comentado)
-- ALTER TABLE products ALTER COLUMN description TYPE VARCHAR(500);
```

#### Ejemplo 4: Agregar un ENUM value

```sql
-- UP
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'crypto';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'apple_pay';

-- DOWN (comentado)
-- No se puede eliminar valores de ENUM fácilmente
-- Requiere recrear el tipo o crear uno nuevo
```

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

1. **Usar IF NOT EXISTS / IF EXISTS**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
   DROP TABLE IF EXISTS temp_table;
   ```

2. **Incluir verificación**
   ```sql
   DO $$
   BEGIN
       IF NOT EXISTS (...) THEN
           RAISE EXCEPTION 'Migración falló';
       END IF;
   END $$;
   ```

3. **Documentar el DOWN (rollback)**
   ```sql
   -- DOWN: Para revertir
   -- ALTER TABLE users DROP COLUMN avatar_url;
   ```

4. **Transacciones implícitas**
   - PostgreSQL ejecuta cada archivo en una transacción
   - Si algo falla, se hace rollback automático

5. **Mensajes informativos**
   ```sql
   RAISE NOTICE '✅ Columna agregada exitosamente';
   ```

### ❌ DON'T (No hacer)

1. **Modificar migraciones ya aplicadas**
   - ❌ NO editar 001_initial_schema.sql después de aplicarlo
   - ✅ Crear una nueva migración (002_fix_something.sql)

2. **Eliminar datos sin respaldo**
   ```sql
   -- ❌ MAL
   DROP TABLE users;
   
   -- ✅ BIEN
   -- Crear backup primero
   CREATE TABLE users_backup AS SELECT * FROM users;
   -- Luego modificar
   ```

3. **Cambios no reversibles sin documentar**
   ```sql
   -- ❌ MAL: Sin comentarios de cómo revertir
   ALTER TABLE products DROP COLUMN old_field;
   
   -- ✅ BIEN: Documentado
   -- DOWN: ALTER TABLE products ADD COLUMN old_field VARCHAR(100);
   ALTER TABLE products DROP COLUMN old_field;
   ```

4. **Depender de orden de ejecución complejo**
   - Cada migración debe ser independiente
   - No asumir estado específico más allá del schema anterior

---

## 🔍 Tracking de Migraciones (Futuro)

Actualmente las migraciones son manuales. Para un sistema más robusto, considera:

### Opción 1: Tabla de migrations

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER
);
```

### Opción 2: Herramientas Node.js

```bash
# Opciones populares:
npm install node-pg-migrate
npm install db-migrate
npm install typeorm  # Incluye migraciones
```

---

## 🚀 Estrategia en Diferentes Ambientes

### Desarrollo Local
```bash
# Puedes usar reset cuando quieras
npm run db:reset  # (cuando lo implementemos)
```

### Staging/Testing
```bash
# Solo migraciones incrementales
npm run db:migrate
```

### Producción
```bash
# NUNCA reset, solo migraciones incrementales
# Con respaldo previo
# Con plan de rollback
npm run db:migrate:production
```

---

## 📊 Versionado en Git

### Flujo Recomendado

```bash
# 1. Crear rama para el cambio
git checkout -b feature/add-reviews

# 2. Crear migración
# Crear: 003_create_reviews_table.sql

# 3. Probar localmente
psql -U postgres -d davistore_db -f src/database/migrations/003_create_reviews_table.sql

# 4. Commit
git add src/database/migrations/003_create_reviews_table.sql
git commit -m "feat: add reviews table (migration 003)"

# 5. Push y PR
git push origin feature/add-reviews
```

### Resolver Conflictos de Numeración

Si dos desarrolladores crean migraciones al mismo tiempo:

```
Developer A: 003_add_reviews.sql
Developer B: 003_add_wishlist.sql  ❌ Conflicto

Solución:
Developer B: Renombrar a 004_add_wishlist.sql
```

---

## 🎓 Resumen

```
┌─────────────────────────────────────────────────────────────┐
│  CUÁNDO USAR CADA ESTRATEGIA                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  000_reset_database.sql                                     │
│  ├─ ⚠️  Solo desarrollo local                               │
│  ├─ ⚠️  Cuando necesitas empezar de cero                    │
│  └─ ⚠️  NUNCA en staging/producción                         │
│                                                             │
│  00X_incremental_migration.sql                              │
│  ├─ ✅ Desarrollo en equipo                                 │
│  ├─ ✅ Staging y producción                                 │
│  ├─ ✅ Control de versiones                                 │
│  ├─ ✅ Historial de cambios                                 │
│  └─ ✅ Rollback controlado                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Recomendación:** Usa migraciones incrementales desde ahora. Solo usa reset cuando realmente necesites empezar de cero en tu entorno local.

