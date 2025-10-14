# Documentación de Endpoints - DaviStore API

## Tabla de Contenidos
- [Autenticación](#autenticación)
- [Gestión de Usuarios](#gestión-de-usuarios)

---

## Autenticación

Base URL: `/api/v1/auth`

### 1. Registrar Usuario

Crea una nueva cuenta de usuario.

**Endpoint:** `POST /api/v1/auth/register`

**Acceso:** Público

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+1234567890"
}
```

**Validaciones:**
- Email: Requerido, formato válido
- Password: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
- first_name: Requerido, 2-100 caracteres, solo letras
- last_name: Requerido, 2-100 caracteres, solo letras
- phone: Opcional, máximo 20 caracteres

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "refreshToken": "eyJhbGciOiJIUzI1..."
    }
  },
  "meta": {
    "message": "Usuario registrado exitosamente"
  }
}
```

---

### 2. Iniciar Sesión

Autentica un usuario y obtiene tokens de acceso.

**Endpoint:** `POST /api/v1/auth/login`

**Acceso:** Público

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "refreshToken": "eyJhbGciOiJIUzI1..."
    }
  },
  "meta": {
    "message": "Inicio de sesión exitoso"
  }
}
```

---

### 3. Refrescar Token

Genera un nuevo access token usando el refresh token.

**Endpoint:** `POST /api/v1/auth/refresh`

**Acceso:** Público

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "refreshToken": "eyJhbGciOiJIUzI1..."
    }
  },
  "meta": {
    "message": "Token refrescado exitosamente"
  }
}
```

---

### 4. Obtener Usuario Actual

Obtiene la información del usuario autenticado.

**Endpoint:** `GET /api/v1/auth/me`

**Acceso:** Privado (requiere token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

---

### 5. Cerrar Sesión

Cierra la sesión del usuario (principalmente para documentación, el logout real es client-side).

**Endpoint:** `POST /api/v1/auth/logout`

**Acceso:** Privado (requiere token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada exitosamente"
  }
}
```

---

## Gestión de Usuarios

Base URL: `/api/v1/users`

### 1. Listar Usuarios

Obtiene una lista paginada de usuarios.

**Endpoint:** `GET /api/v1/users`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por email, nombre o apellido
- `isActive` (opcional): Filtrar por estado activo (true/false)
- `roleId` (opcional): Filtrar por rol (UUID)

**Ejemplo:**
```
GET /api/v1/users?page=1&limit=10&search=juan&isActive=true
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Obtener Usuario por ID

Obtiene información de un usuario específico.

**Endpoint:** `GET /api/v1/users/:id`

**Acceso:** Privado (Propietario o Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

---

### 3. Actualizar Usuario

Actualiza la información de un usuario.

**Endpoint:** `PUT /api/v1/users/:id`

**Acceso:** Privado (Propietario o Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body (todos los campos son opcionales):**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "NewPassword123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+1234567890",
  "role_id": "uuid"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "nuevo@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  },
  "meta": {
    "message": "Usuario actualizado exitosamente"
  }
}
```

---

### 4. Eliminar Usuario

Desactiva un usuario (soft delete).

**Endpoint:** `DELETE /api/v1/users/:id`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (204):**
```
No Content
```

---

### 5. Activar Usuario

Activa un usuario previamente desactivado.

**Endpoint:** `PATCH /api/v1/users/:id/activate`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  },
  "meta": {
    "message": "Usuario activado exitosamente"
  }
}
```

---

### 6. Desactivar Usuario

Desactiva un usuario activo.

**Endpoint:** `PATCH /api/v1/users/:id/deactivate`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890",
      "role_id": "uuid",
      "is_active": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "role": {
        "id": "uuid",
        "name": "customer",
        "display_name": "Cliente",
        "description": "Usuario regular...",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  },
  "meta": {
    "message": "Usuario desactivado exitosamente"
  }
}
```

---

## Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Debe ser un email válido",
        "value": "invalid-email"
      }
    ]
  }
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Token no proporcionado",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Acceso denegado. Se requiere uno de los siguientes roles: admin",
    "code": "FORBIDDEN"
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado",
    "code": "NOT_FOUND"
  }
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": {
    "message": "El email ya está registrado",
    "code": "CONFLICT_ERROR"
  }
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## Notas de Implementación

### Autenticación JWT

- **Access Token**: Expira en 15 minutos (configurable)
- **Refresh Token**: Expira en 7 días (configurable)
- Los tokens deben enviarse en el header `Authorization: Bearer <token>`

### Paginación

- Por defecto: página 1, 10 elementos por página
- Máximo de elementos por página: 100

### Roles

- **customer**: Usuario regular con permisos de compra
- **admin**: Usuario con acceso completo al sistema

### Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT están firmados con secretos configurables
- Las rutas protegidas requieren autenticación válida
- Algunas rutas requieren roles específicos

