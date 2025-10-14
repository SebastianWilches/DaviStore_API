# 📝 Changelog - DaviStore Backend

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.0.0] - 2024-10-14

### ✨ Added (Agregado)

#### Sistema de Roles Escalable
- **Tabla `roles`** en lugar de ENUM para máxima escalabilidad
- 2 roles iniciales: `customer`, `admin` (suficientes para MVP)
- Campos adicionales: `display_name`, `description`
- Vista `v_users_with_role` para consultas optimizadas
- Extensible: Agregar más roles con simple INSERT cuando sea necesario

#### Base de Datos Completa
- 9 tablas principales (incluyendo `roles`)
- 20+ índices optimizados
- Triggers automáticos para `updated_at`
- Función `generate_order_number()` para números únicos
- Vistas útiles para queries complejas

#### Scripts de Migración
- **Windows**: Scripts PowerShell (`.ps1`)
  - `reset-and-migrate.ps1` - Reset completo (dev)
  - `migrate.ps1` - Migraciones incrementales
  - `find-psql.ps1` - Encontrar PostgreSQL

- **Linux/Mac**: Scripts Bash (`.sh`)
  - `reset-and-migrate.sh` - Reset completo (dev)
  - `migrate.sh` - Migraciones incrementales
  - `backup.sh` - Crear backups
  - `restore.sh` - Restaurar backups

#### Documentación Completa
- `README.md` - Documentación principal
- `DATABASE_DESIGN.md` - Diseño detallado de BD
- `DATABASE_ER_DIAGRAM.md` - Diagrama ER visual
- `BEST_PRACTICES.md` - Principios SOLID, DRY, Clean Code
- `QUICK_START.md` - Guía de instalación paso a paso
- `DEPLOYMENT.md` - Guía de deployment a producción
- `CART_STRATEGIES.md` - Estrategias de carrito
- `ROLES_DESIGN.md` - Diseño de sistema de roles
- `MIGRACIONES.md` - Guía de migraciones

#### Configuración del Proyecto
- TypeScript con strict mode
- ESLint + Prettier
- Jest para testing
- Nodemon para desarrollo
- Path aliases configurados

#### Modelos TypeScript
- `Role` - Modelo de roles
- `User` - Modelo de usuarios (con `role_id`)
- `UserWithRole` - Usuario con información de rol
- `Product` - Modelo de productos

---

## Decisiones de Diseño

### ¿Por qué Tabla en lugar de ENUM?

**Antes (ENUM):**
```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
ALTER TABLE users ADD COLUMN role user_role;
```

**Problema:** Agregar roles requiere `ALTER TYPE`, complejo y bloquea tabla.

**Ahora (Tabla):**
```sql
CREATE TABLE roles (...);
ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);
```

**Ventajas:**
- ✅ Agregar roles: Simple `INSERT`
- ✅ Metadatos: `display_name`, `description`
- ✅ Extensible: Fácil agregar columnas
- ✅ UI de admin: Gestionar roles desde interfaz
- ✅ Sin migraciones complejas

### Principios Aplicados

#### SOLID
- **S**: Cada tabla tiene una responsabilidad única
- **O**: Roles extensibles sin modificar código
- **L**: Patrones consistentes en todas las tablas
- **I**: Tablas específicas vs genéricas
- **D**: Foreign Keys como abstracciones

#### DRY
- Normalización de datos
- Triggers reutilizables
- Funciones genéricas

#### Clean Code
- Nombres descriptivos
- Constraints explícitos
- Validaciones multi-capa
- Comentarios que añaden valor

---

## Roadmap Futuro

### Fase 2: Implementación de Lógica
- [ ] Autenticación (JWT)
- [ ] CRUD de usuarios
- [ ] CRUD de productos
- [ ] Sistema de carrito
- [ ] Gestión de órdenes
- [ ] Integración de pagos

### Fase 3: Features Avanzadas
- [ ] Sistema de permisos (RBAC completo)
- [ ] Carritos de invitados
- [ ] Sistema de reviews
- [ ] Cupones y descuentos
- [ ] Wishlist
- [ ] Notificaciones

### Fase 4: Optimización
- [ ] Cache con Redis
- [ ] Búsqueda con Elasticsearch
- [ ] CDN para imágenes
- [ ] Rate limiting avanzado

---

## Notas de Migración

### De ENUM a Tabla de Roles

Si tienes un sistema existente con ENUM, ver `ROLES_DESIGN.md` sección "Migración".

### Backup Antes de Cambios

En producción, SIEMPRE:
```bash
./src/database/scripts/backup.sh
./src/database/scripts/migrate.sh
```

---

## Contribuidores

- Sebastián - Desarrollo inicial y diseño de BD

---

## Licencia

Este proyecto es privado y confidencial.

