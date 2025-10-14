# 👥 Sistema de Roles - ENUM vs Tabla Separada

## 🎯 Pregunta del Usuario

> "¿Podríamos crear una tabla `roles` separada en lugar de ENUM para hacerlo más escalable?"

**Respuesta Corta:** ¡SÍ! Es una excelente idea para escalabilidad real.

---

## 📊 Análisis de Opciones

### ❌ OPCIÓN 1: ENUM (Diseño Actual)

```sql
-- Diseño actual
CREATE TYPE user_role AS ENUM ('customer', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    role user_role DEFAULT 'customer',
    ...
);
```

#### Ventajas ✅

- **Simplicidad**: Muy fácil de implementar
- **Performance**: Muy rápido (almacena internamente como entero)
- **Type-safe**: PostgreSQL valida los valores
- **Sin JOINs**: Menos queries
- **Ideal para roles fijos**

#### Desventajas ❌

- **Difícil de modificar**: Agregar/eliminar roles requiere ALTER TYPE
- **No escalable**: No puedes tener "roles dinámicos"
- **Sin metadatos**: No puedes guardar descripción, permisos, etc.
- **Sin roles por usuario**: Un usuario = un rol
- **No soporta RBAC complejo**: (Role-Based Access Control)

#### Cuándo Modificar un ENUM

```sql
-- Agregar nuevo valor al ENUM
ALTER TYPE user_role ADD VALUE 'moderator';
ALTER TYPE user_role ADD VALUE 'vendor';

-- ⚠️ PROBLEMA: No puedes eliminar valores
-- ⚠️ PROBLEMA: No puedes renombrar valores fácilmente
-- ⚠️ PROBLEMA: Requiere ALTER TYPE (puede bloquear tabla)
```

#### Cuándo Usar ENUM

- ✅ Roles fijos y predefinidos (customer, admin)
- ✅ No cambiarán frecuentemente
- ✅ Sistema simple
- ✅ MVP / Prueba técnica
- ❌ Sistema con roles dinámicos
- ❌ SaaS con roles personalizables

---

### ✅ OPCIÓN 2: Tabla de Roles (Escalable)

```sql
-- Tabla de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modificar tabla users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL,  -- FK a roles
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

-- Índice para optimizar búsquedas
CREATE INDEX idx_users_role ON users(role_id);

-- Datos iniciales
INSERT INTO roles (name, display_name, description) VALUES
('customer', 'Cliente', 'Usuario regular que puede comprar productos'),
('admin', 'Administrador', 'Usuario con acceso completo al sistema'),
('moderator', 'Moderador', 'Usuario que puede moderar contenido'),
('vendor', 'Vendedor', 'Usuario que puede vender productos');
```

#### Ventajas ✅

- **Escalable**: Agregar/eliminar roles fácilmente
- **Flexible**: Puedes agregar campos (permisos, color, icono)
- **Sin migraciones complejas**: Solo INSERT/UPDATE
- **Metadatos**: Descripción, display_name, etc.
- **Preparado para RBAC**: Fácil agregar tabla de permisos
- **Roles dinámicos**: Admin puede crear roles desde UI
- **Auditoría**: Puedes saber cuándo se creó cada rol

#### Desventajas ❌

- **Más complejo**: Requiere JOIN en queries
- **Performance**: Ligeramente más lento (despreciable)
- **Más tablas**: Mayor complejidad de schema
- **Integridad**: Necesitas datos iniciales (seeds)

#### Cuándo Usar Tabla de Roles

- ✅ Sistema con múltiples roles
- ✅ Roles que pueden cambiar
- ✅ SaaS / Multi-tenant
- ✅ Sistema que crecerá
- ✅ Necesitas RBAC (permisos granulares)
- ✅ Admin puede crear roles

---

### 🚀 OPCIÓN 3: Tabla de Roles + Permisos (RBAC Completo)

Para sistemas realmente escalables:

```sql
-- Tabla de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de permisos
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,  -- Ej: 'products:create'
    display_name VARCHAR(100) NOT NULL,  -- Ej: 'Crear Productos'
    description TEXT,
    resource VARCHAR(50) NOT NULL,  -- Ej: 'products', 'orders', 'users'
    action VARCHAR(50) NOT NULL,    -- Ej: 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_permission UNIQUE(resource, action)
);

-- Tabla intermedia: roles_permissions (N:M)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) 
        REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT unique_role_permission UNIQUE(role_id, permission_id)
);

-- Tabla users (modificada)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

-- Opcional: user_permissions (permisos específicos por usuario)
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted BOOLEAN DEFAULT true,  -- true = grant, false = revoke
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_permission_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_permission_permission FOREIGN KEY (permission_id) 
        REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_permission UNIQUE(user_id, permission_id)
);

-- Índices
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- Datos de ejemplo
INSERT INTO roles (name, display_name, description) VALUES
('customer', 'Cliente', 'Usuario que puede comprar productos'),
('admin', 'Administrador', 'Acceso completo al sistema'),
('vendor', 'Vendedor', 'Puede gestionar sus propios productos'),
('moderator', 'Moderador', 'Puede moderar contenido y órdenes');

INSERT INTO permissions (name, display_name, resource, action) VALUES
-- Products
('products:read', 'Ver Productos', 'products', 'read'),
('products:create', 'Crear Productos', 'products', 'create'),
('products:update', 'Actualizar Productos', 'products', 'update'),
('products:delete', 'Eliminar Productos', 'products', 'delete'),

-- Orders
('orders:read', 'Ver Órdenes', 'orders', 'read'),
('orders:read_all', 'Ver Todas las Órdenes', 'orders', 'read_all'),
('orders:update_status', 'Actualizar Estado de Orden', 'orders', 'update_status'),

-- Users
('users:read', 'Ver Usuarios', 'users', 'read'),
('users:create', 'Crear Usuarios', 'users', 'create'),
('users:update', 'Actualizar Usuarios', 'users', 'update'),
('users:delete', 'Eliminar Usuarios', 'users', 'delete');

-- Asignar permisos a roles
-- Admin: todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin';

-- Customer: solo ver productos y sus órdenes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'customer' AND p.name IN ('products:read', 'orders:read');

-- Vendor: gestionar productos y ver órdenes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'vendor' AND p.name LIKE 'products:%' OR p.name = 'orders:read_all';
```

#### Ventajas de RBAC Completo ✅

- **Máxima flexibilidad**: Permisos granulares
- **Escalable**: Agregar permisos sin cambiar código
- **Multi-tenant ready**: Diferentes permisos por tenant
- **Auditoría completa**: Quién puede hacer qué
- **UI de admin**: Gestionar permisos desde interfaz
- **Overrides**: Permisos específicos por usuario

#### Desventajas ❌

- **Complejidad alta**: Muchas tablas y relaciones
- **Performance**: Múltiples JOINs
- **Overhead**: Para sistemas simples es excesivo

---

## 📊 Comparación de Opciones

| Característica | ENUM | Tabla Roles | RBAC Completo |
|----------------|------|-------------|---------------|
| **Complejidad** | Baja | Media | Alta |
| **Escalabilidad** | Baja | Alta | Muy Alta |
| **Performance** | Excelente | Buena | Aceptable |
| **Flexibilidad** | Baja | Alta | Máxima |
| **Mantenimiento** | Fácil | Medio | Complejo |
| **Roles dinámicos** | No | Sí | Sí |
| **Permisos granulares** | No | No | Sí |
| **Multi-role por usuario** | No | No | Sí (con modificación) |
| **Ideal para** | MVP | Prod Simple | Enterprise |

---

## 🎯 Recomendación para DaviStore

### Para Prueba Técnica (Ahora)

**Usa OPCIÓN 1 (ENUM actual)** porque:
- ✅ Suficiente para la prueba técnica
- ✅ Demuestra conocimiento de tipos PostgreSQL
- ✅ Más rápido de implementar
- ✅ Solo necesitas customer/admin

**Pero menciona en la documentación:**
```markdown
## Escalabilidad de Roles

El sistema actualmente usa ENUM para roles (customer, admin), 
lo cual es suficiente para las necesidades actuales. 

Para escalar a sistemas con roles dinámicos, se puede migrar 
a una tabla `roles` separada sin cambios significativos en la 
lógica de negocio.
```

### Para Producción (Futuro)

**Usa OPCIÓN 2 (Tabla Roles)** porque:
- ✅ Escalable sin ser excesivo
- ✅ Fácil agregar roles nuevos
- ✅ Sin complejidad innecesaria
- ✅ Balance perfecto

**Usa OPCIÓN 3 (RBAC Completo) solo si:**
- Necesitas permisos muy granulares
- Sistema multi-tenant
- SaaS con planes diferentes
- Enterprise software

---

## 🔄 Migración: ENUM → Tabla de Roles

Si decides cambiar a tabla de roles después:

```sql
-- Migración 005: Convertir roles de ENUM a tabla
-- Paso 1: Crear tabla de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paso 2: Insertar roles existentes
INSERT INTO roles (name, display_name, description) VALUES
('customer', 'Cliente', 'Usuario regular del sistema'),
('admin', 'Administrador', 'Usuario con acceso completo');

-- Paso 3: Agregar columna temporal en users
ALTER TABLE users ADD COLUMN role_id_new UUID;

-- Paso 4: Migrar datos
UPDATE users u
SET role_id_new = r.id
FROM roles r
WHERE u.role::text = r.name;

-- Paso 5: Verificar que no hay nulls
SELECT COUNT(*) FROM users WHERE role_id_new IS NULL;
-- Si es 0, continuar

-- Paso 6: Hacer columna NOT NULL y agregar FK
ALTER TABLE users ALTER COLUMN role_id_new SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT fk_user_role 
    FOREIGN KEY (role_id_new) REFERENCES roles(id) ON DELETE RESTRICT;

-- Paso 7: Eliminar columna vieja
ALTER TABLE users DROP COLUMN role;

-- Paso 8: Renombrar columna nueva
ALTER TABLE users RENAME COLUMN role_id_new TO role_id;

-- Paso 9: Crear índice
CREATE INDEX idx_users_role ON users(role_id);

-- Paso 10: Eliminar el tipo ENUM (opcional)
-- DROP TYPE user_role CASCADE;  -- Solo si no se usa en otro lugar

-- Comentarios
COMMENT ON TABLE roles IS 'Roles del sistema con información adicional';
COMMENT ON COLUMN users.role_id IS 'Rol del usuario (FK a roles)';
```

---

## 💻 Código Backend con Tabla de Roles

### Model (TypeScript)

```typescript
// models/Role.ts
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// models/User.ts (modificado)
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_id: string;  // FK a roles
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Para joins
export interface UserWithRole extends User {
  role: Role;
}
```

### Repository

```typescript
// repositories/UserRepository.ts
class UserRepository {
  async findByIdWithRole(id: string): Promise<UserWithRole | null> {
    const query = `
      SELECT 
        u.*,
        json_build_object(
          'id', r.id,
          'name', r.name,
          'display_name', r.display_name,
          'description', r.description
        ) as role
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

// repositories/RoleRepository.ts
class RoleRepository {
  async findAll(): Promise<Role[]> {
    const query = 'SELECT * FROM roles WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  async findByName(name: string): Promise<Role | null> {
    const query = 'SELECT * FROM roles WHERE name = $1 AND is_active = true';
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const query = `
      INSERT INTO roles (name, display_name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.name,
      data.display_name,
      data.description
    ]);
    return result.rows[0];
  }
}
```

### Middleware (Authorization)

```typescript
// middlewares/authorization.ts
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Del authMiddleware
    
    if (!user) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    // Obtener rol del usuario
    const userWithRole = await userRepository.findByIdWithRole(user.id);
    
    if (!userWithRole || !allowedRoles.includes(userWithRole.role.name)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

// Uso en rutas
router.post('/products', 
  authMiddleware,
  requireRole('admin', 'vendor'),  // Solo admin o vendor
  productController.create
);
```

---

## 🎓 Resumen y Recomendación Final

### Tu Pregunta

> "¿Crear tabla de roles para hacerlo escalable?"

**Respuesta:** ¡Excelente idea! Pero depende del contexto:

### Para la Prueba Técnica

```
Recomendación: Mantener ENUM (actual)
Razón: Suficiente para demostrar conocimientos
Mejora: Documentar en README que puede escalarse a tabla
```

### Para Producción Real

```
Recomendación: Tabla de Roles (Opción 2)
Razón: Balance perfecto entre simplicidad y escalabilidad
Cuándo: Desde el inicio si planeas crecer
```

### Para Enterprise

```
Recomendación: RBAC Completo (Opción 3)
Razón: Máxima flexibilidad
Cuándo: Multi-tenant, SaaS, permisos muy granulares
```

---

¿Quieres que cree la migración para convertir a tabla de roles ahora, o prefieres mantener el ENUM para la prueba técnica?

