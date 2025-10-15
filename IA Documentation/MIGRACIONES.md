# 🔄 Guía de Migraciones de Base de Datos

## 🎯 Estrategia Implementada

He configurado **dos enfoques** para manejar cambios en la base de datos:

### 1️⃣ Reset Completo (Solo Desarrollo Local)

**Cuándo usar:** Cuando necesitas empezar de cero en tu máquina local.

```powershell
# Opción A: Comando npm
npm run db:reset

# Opción B: Script directo
powershell -ExecutionPolicy Bypass -File src/database/scripts/reset-and-migrate.ps1

# Opción C: SQL directo
psql -U postgres -d davistore_db -f src/database/migrations/000_reset_database.sql
psql -U postgres -d davistore_db -f src/database/migrations/001_initial_schema.sql
```

**Qué hace:**
- ✅ Elimina TODAS las tablas, tipos, funciones
- ✅ Ejecuta el schema inicial desde cero
- ✅ Carga datos de ejemplo (admin, categorías, productos)
- ⚠️ PIERDE TODOS LOS DATOS

---

### 2️⃣ Migraciones Incrementales (Recomendado para Equipo)

**Cuándo usar:** Siempre que trabajes en equipo o en producción.

```powershell
# Aplicar una migración específica
npm run db:migrate:file 002_add_user_avatar.sql

# Aplicar todas las migraciones pendientes
npm run db:migrate

# SQL directo (una migración)
psql -U postgres -d davistore_db -f src/database/migrations/002_add_user_avatar.sql
```

**Qué hace:**
- ✅ Aplica cambios incrementales
- ✅ Mantiene datos existentes
- ✅ Control de versiones
- ✅ Rollback documentado

---

## 📁 Archivos Creados

```
src/database/
├── migrations/
│   ├── 000_reset_database.sql        ⚠️  Reset completo
│   ├── 001_initial_schema.sql        ✅  Schema inicial
│   ├── 002_example_add_user_avatar.sql  ✅  Ejemplo de migración
│   └── README.md                     📚  Documentación completa
│
└── scripts/
    ├── reset-and-migrate.ps1         🔧  Script de reset
    └── migrate.ps1                   🔧  Script de migración
```

---

## 🚀 Flujos de Trabajo

### Escenario 1: Primera Vez (Setup)

```powershell
# 1. Crear base de datos
psql -U postgres -c "CREATE DATABASE davistore_db;"

# 2. Aplicar schema inicial
psql -U postgres -d davistore_db -f src/database/migrations/001_initial_schema.sql

# ¡Listo! Ya tienes todo configurado
```

---

### Escenario 2: Desarrollo Local - Experimentando

```powershell
# Haces cambios, pruebas, no te gusta...
# Quieres empezar de cero

npm run db:reset

# Vuelves al estado inicial limpio
```

---

### Escenario 3: Trabajo en Equipo

**Tú creas una nueva feature que necesita cambios en BD:**

```powershell
# 1. Crear nueva migración
# Archivo: 003_add_product_ratings.sql

# 2. Probar localmente
npm run db:migrate:file 003_add_product_ratings.sql

# 3. Commit y push
git add src/database/migrations/003_add_product_ratings.sql
git commit -m "feat: add product ratings (migration 003)"
git push
```

**Tu compañero recibe los cambios:**

```powershell
# 1. Pull del repositorio
git pull

# 2. Aplicar las nuevas migraciones
npm run db:migrate

# ¡Listo! Su BD está actualizada
```

---

### Escenario 4: Producción

```bash
# NUNCA usar reset en producción
# Solo migraciones incrementales

# 1. Backup de la BD
pg_dump -U postgres davistore_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar migración
psql -U postgres -d davistore_db -f src/database/migrations/003_new_feature.sql

# 3. Verificar que funciona

# 4. Si algo sale mal, restaurar backup
# psql -U postgres -d davistore_db < backup_20241014_120000.sql
```

---

## ✍️ Crear Nueva Migración

### Paso 1: Crear el archivo

```powershell
# Nombre: 003_add_product_discount.sql
# En: src/database/migrations/
```

### Paso 2: Usar el template

```sql
-- =====================================================
-- MIGRACIÓN 003: Agregar sistema de descuentos
-- Fecha: 2024-10-14
-- Descripción: Agregar columna de descuento a productos
-- =====================================================

-- =====================================================
-- UP: Aplicar cambios
-- =====================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE products
ADD CONSTRAINT discount_valid 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

COMMENT ON COLUMN products.discount_percentage IS 
    'Porcentaje de descuento aplicado (0-100)';

-- =====================================================
-- Verificación
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'discount_percentage'
    ) THEN
        RAISE NOTICE '✅ Migración 003 aplicada: discount_percentage agregado';
    ELSE
        RAISE EXCEPTION '❌ Error: La columna no fue creada';
    END IF;
END $$;

-- =====================================================
-- DOWN: Revertir cambios
-- =====================================================

-- Para revertir:
-- ALTER TABLE products DROP COLUMN IF EXISTS discount_percentage CASCADE;
```

### Paso 3: Probar

```powershell
npm run db:migrate:file 003_add_product_discount.sql
```

### Paso 4: Commit

```powershell
git add src/database/migrations/003_add_product_discount.sql
git commit -m "feat: add discount system (migration 003)"
git push
```

---

## 📊 Comparación de Estrategias

| Característica | Reset Completo | Migraciones Incrementales |
|----------------|----------------|---------------------------|
| **Velocidad** | ⚡ Rápido | 🐢 Más lento |
| **Control** | ❌ Pierdes todo | ✅ Control total |
| **Historial** | ❌ No | ✅ Completo |
| **Rollback** | ❌ No | ✅ Documentado |
| **Equipo** | ❌ No recomendado | ✅ Perfecto |
| **Producción** | ❌❌❌ NUNCA | ✅ Único válido |
| **Desarrollo** | ✅ Útil para limpiar | ✅ También válido |

---

## 🎯 Recomendación Final

```
┌─────────────────────────────────────────────────────────────┐
│  MI RECOMENDACIÓN                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. USA MIGRACIONES INCREMENTALES como práctica principal  │
│                                                             │
│  2. Usa reset solo cuando:                                 │
│     • Estás experimentando localmente                      │
│     • Tienes la BD en mal estado                           │
│     • Quieres empezar limpio (sin datos importantes)       │
│                                                             │
│  3. En equipo: SOLO migraciones incrementales              │
│                                                             │
│  4. En producción: SOLO migraciones incrementales          │
│     + SIEMPRE hacer backup primero                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Ventajas de Migraciones Incrementales

### ✅ Para ti

- Historial claro de cambios
- Puedes deshacer errores
- Aprendes buenas prácticas reales
- Portfolio profesional

### ✅ Para el equipo

- Sin conflictos de BD
- Cada uno puede trabajar en features separadas
- Fácil sincronización
- Comunicación clara de cambios

### ✅ Para el proyecto

- Auditoría completa
- Facilita debugging
- Compatible con CI/CD
- Preparado para escalar

---

## 📚 Documentación Completa

Lee `src/database/migrations/README.md` para:
- ✅ Template completo de migraciones
- ✅ Ejemplos de todos los tipos de cambios
- ✅ Mejores prácticas detalladas
- ✅ Solución de problemas
- ✅ Estrategias avanzadas

---

## 🚀 Empezar Ahora

```powershell
# 1. Primera vez (setup)
npm run db:reset

# 2. Verificar que funciona
psql -U postgres -d davistore_db -c "\dt"

# Deberías ver 8 tablas creadas

# 3. ¡A desarrollar!
npm run dev
```

---

**¡Estás listo para trabajar con migraciones de forma profesional!** 🎉

