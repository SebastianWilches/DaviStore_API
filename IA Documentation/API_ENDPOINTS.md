# Documentación de Endpoints - DaviStore API

## Tabla de Contenidos
- [Autenticación](#autenticación)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Gestión de Categorías](#gestión-de-categorías)
- [Gestión de Productos](#gestión-de-productos)
- [Carrito de Compras](#carrito-de-compras)
- [Gestión de Órdenes](#gestión-de-órdenes)
- [Códigos de Error Comunes](#códigos-de-error-comunes)

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

## Gestión de Categorías

Base URL: `/api/v1/categories`

### 1. Listar Categorías

Obtiene una lista de todas las categorías.

**Endpoint:** `GET /api/v1/categories`

**Acceso:** Público

**Query Parameters:**
- `includeInactive` (opcional): Incluir categorías inactivas (default: false)

**Ejemplo:**
```
GET /api/v1/categories?includeInactive=false
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electrónica",
        "slug": "electronica",
        "description": "Dispositivos y accesorios electrónicos",
        "parent_id": null,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "parent_name": null,
        "parent_slug": null
      }
    ]
  }
}
```

---

### 2. Obtener Árbol de Categorías

Obtiene las categorías organizadas en estructura jerárquica con sus subcategorías.

**Endpoint:** `GET /api/v1/categories/tree`

**Acceso:** Público

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electrónica",
        "slug": "electronica",
        "description": "Dispositivos y accesorios electrónicos",
        "parent_id": null,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": [
          {
            "id": "uuid",
            "name": "Smartphones",
            "slug": "smartphones",
            "description": "Teléfonos inteligentes",
            "parent_id": "uuid",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Obtener Categoría por ID

Obtiene información de una categoría específica por su ID.

**Endpoint:** `GET /api/v1/categories/:id`

**Acceso:** Público

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "description": "Dispositivos y accesorios electrónicos",
      "parent_id": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "parent_name": null,
      "parent_slug": null
    }
  }
}
```

---

### 4. Obtener Categoría por Slug

Obtiene información de una categoría específica por su slug.

**Endpoint:** `GET /api/v1/categories/slug/:slug`

**Acceso:** Público

**Ejemplo:**
```
GET /api/v1/categories/slug/electronica
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "description": "Dispositivos y accesorios electrónicos",
      "parent_id": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "parent_name": null,
      "parent_slug": null
    }
  }
}
```

---

### 5. Crear Categoría

Crea una nueva categoría.

**Endpoint:** `POST /api/v1/categories`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Teléfonos inteligentes",
  "parent_id": "uuid"
}
```

**Validaciones:**
- name: Requerido, 2-100 caracteres
- slug: Requerido, formato kebab-case (a-z0-9-)
- description: Opcional
- parent_id: Opcional, UUID válido

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Teléfonos inteligentes",
      "parent_id": "uuid",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Categoría creada exitosamente"
  }
}
```

---

### 6. Actualizar Categoría

Actualiza una categoría existente.

**Endpoint:** `PUT /api/v1/categories/:id`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body (todos los campos son opcionales):**
```json
{
  "name": "Teléfonos Inteligentes",
  "slug": "telefonos-inteligentes",
  "description": "Smartphones de última generación",
  "parent_id": "uuid",
  "is_active": false
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Teléfonos Inteligentes",
      "slug": "telefonos-inteligentes",
      "description": "Smartphones de última generación",
      "parent_id": "uuid",
      "is_active": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:10:00.000Z"
    }
  },
  "meta": {
    "message": "Categoría actualizada exitosamente"
  }
}
```

---

### 7. Eliminar Categoría

Elimina una categoría (solo si no tiene productos ni subcategorías).

**Endpoint:** `DELETE /api/v1/categories/:id`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "message": "Categoría eliminada exitosamente"
  }
}
```

---

## Gestión de Productos

Base URL: `/api/v1/products`

### 1. Listar Productos

Obtiene una lista paginada de productos con filtros y búsqueda.

**Endpoint:** `GET /api/v1/products`

**Acceso:** Público

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por nombre o descripción
- `categoryId` (opcional): Filtrar por categoría (UUID)
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `inStock` (opcional): Solo productos en stock (true/false)
- `sortBy` (opcional): Campo para ordenar (name, price, stock, created_at)
- `sortOrder` (opcional): Orden (asc/desc, default: asc)

**Ejemplo:**
```
GET /api/v1/products?page=1&limit=10&search=laptop&categoryId=uuid&minPrice=500&maxPrice=2000&inStock=true&sortBy=price&sortOrder=asc
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Laptop Dell XPS 15",
        "description": "Laptop de alto rendimiento",
        "sku": "DELL-XPS15-001",
        "price": 1299.99,
        "stock_quantity": 15,
        "category_id": "uuid",
        "image_url": "https://example.com/laptop.jpg",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "category": {
          "id": "uuid",
          "name": "Laptops",
          "slug": "laptops"
        }
      }
    ]
  },
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

### 2. Obtener Producto por ID

Obtiene información detallada de un producto específico.

**Endpoint:** `GET /api/v1/products/:id`

**Acceso:** Público

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Laptop Dell XPS 15",
      "description": "Laptop de alto rendimiento con procesador Intel Core i7",
      "sku": "DELL-XPS15-001",
      "price": 1299.99,
      "stock_quantity": 15,
      "category_id": "uuid",
      "image_url": "https://example.com/laptop.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Laptops",
        "slug": "laptops",
        "description": "Computadoras portátiles"
      }
    }
  }
}
```

---

### 3. Obtener Producto por SKU

Obtiene información de un producto por su SKU.

**Endpoint:** `GET /api/v1/products/sku/:sku`

**Acceso:** Público

**Ejemplo:**
```
GET /api/v1/products/sku/DELL-XPS15-001
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Laptop Dell XPS 15",
      "description": "Laptop de alto rendimiento",
      "sku": "DELL-XPS15-001",
      "price": 1299.99,
      "stock_quantity": 15,
      "category_id": "uuid",
      "image_url": "https://example.com/laptop.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Laptops",
        "slug": "laptops"
      }
    }
  }
}
```

---

### 4. Crear Producto

Crea un nuevo producto.

**Endpoint:** `POST /api/v1/products`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "description": "Laptop de alto rendimiento con procesador Intel Core i7",
  "sku": "DELL-XPS15-001",
  "price": 1299.99,
  "stock_quantity": 15,
  "category_id": "uuid",
  "image_url": "https://example.com/laptop.jpg"
}
```

**Validaciones:**
- name: Requerido, 2-200 caracteres
- description: Requerido
- sku: Requerido, único, formato alfanumérico con guiones
- price: Requerido, número positivo
- stock_quantity: Requerido, entero no negativo
- category_id: Requerido, UUID válido
- image_url: Opcional, URL válida

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Laptop Dell XPS 15",
      "description": "Laptop de alto rendimiento con procesador Intel Core i7",
      "sku": "DELL-XPS15-001",
      "price": 1299.99,
      "stock_quantity": 15,
      "category_id": "uuid",
      "image_url": "https://example.com/laptop.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Producto creado exitosamente"
  }
}
```

---

### 5. Actualizar Producto

Actualiza un producto existente.

**Endpoint:** `PUT /api/v1/products/:id`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body (todos los campos son opcionales):**
```json
{
  "name": "Laptop Dell XPS 15 (2024)",
  "description": "Nueva versión mejorada",
  "sku": "DELL-XPS15-002",
  "price": 1399.99,
  "stock_quantity": 20,
  "category_id": "uuid",
  "image_url": "https://example.com/laptop-new.jpg",
  "is_active": true
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Laptop Dell XPS 15 (2024)",
      "description": "Nueva versión mejorada",
      "sku": "DELL-XPS15-002",
      "price": 1399.99,
      "stock_quantity": 20,
      "category_id": "uuid",
      "image_url": "https://example.com/laptop-new.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-02T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Producto actualizado exitosamente"
  }
}
```

---

### 6. Actualizar Stock de Producto

Actualiza la cantidad de stock de un producto.

**Endpoint:** `PATCH /api/v1/products/:id/stock`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "stock_quantity": 25
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Laptop Dell XPS 15",
      "description": "Laptop de alto rendimiento",
      "sku": "DELL-XPS15-001",
      "price": 1299.99,
      "stock_quantity": 25,
      "category_id": "uuid",
      "image_url": "https://example.com/laptop.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-02T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Stock actualizado exitosamente"
  }
}
```

---

### 7. Eliminar Producto

Desactiva un producto (soft delete).

**Endpoint:** `DELETE /api/v1/products/:id`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "message": "Producto eliminado exitosamente"
  }
}
```

---

## Carrito de Compras

Base URL: `/api/v1/cart`

**Nota:** Todas las rutas del carrito requieren autenticación.

### 1. Obtener Carrito

Obtiene el carrito del usuario autenticado con todos sus items.

**Endpoint:** `GET /api/v1/cart`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "cart_id": "uuid",
          "product_id": "uuid",
          "quantity": 2,
          "price_at_addition": 1299.99,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z",
          "product": {
            "id": "uuid",
            "name": "Laptop Dell XPS 15",
            "description": "Laptop de alto rendimiento",
            "sku": "DELL-XPS15-001",
            "price": 1299.99,
            "stock_quantity": 15,
            "category_id": "uuid",
            "image_url": "https://example.com/laptop.jpg",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
          }
        }
      ],
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97
    }
  }
}
```

---

### 2. Obtener Resumen del Carrito

Obtiene un resumen rápido del carrito (cantidad de items y total).

**Endpoint:** `GET /api/v1/cart/summary`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "itemCount": 3,
    "subtotal": 2599.98,
    "tax": 259.99,
    "shipping_cost": 50.00,
    "total": 2909.97
  }
}
```

---

### 3. Agregar Producto al Carrito

Agrega un producto al carrito o incrementa su cantidad si ya existe.

**Endpoint:** `POST /api/v1/cart/items`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

**Validaciones:**
- product_id: Requerido, UUID válido
- quantity: Requerido, entero positivo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "cart_id": "uuid",
          "product_id": "uuid",
          "quantity": 2,
          "price_at_addition": 1299.99,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z",
          "product": {
            "id": "uuid",
            "name": "Laptop Dell XPS 15",
            "sku": "DELL-XPS15-001",
            "price": 1299.99,
            "stock_quantity": 13,
            "image_url": "https://example.com/laptop.jpg"
          }
        }
      ],
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97
    }
  },
  "meta": {
    "message": "Producto agregado al carrito exitosamente"
  }
}
```

---

### 4. Actualizar Cantidad de Item

Actualiza la cantidad de un item específico en el carrito.

**Endpoint:** `PUT /api/v1/cart/items/:itemId`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "quantity": 3
}
```

**Validaciones:**
- quantity: Requerido, entero positivo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "status": "active",
      "items": [
        {
          "id": "uuid",
          "cart_id": "uuid",
          "product_id": "uuid",
          "quantity": 3,
          "price_at_addition": 1299.99,
          "product": {
            "name": "Laptop Dell XPS 15",
            "price": 1299.99,
            "stock_quantity": 12
          }
        }
      ],
      "subtotal": 3899.97,
      "tax": 389.99,
      "shipping_cost": 50.00,
      "total": 4339.96
    }
  },
  "meta": {
    "message": "Cantidad actualizada exitosamente"
  }
}
```

---

### 5. Eliminar Item del Carrito

Elimina un item específico del carrito.

**Endpoint:** `DELETE /api/v1/cart/items/:itemId`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "message": "Item eliminado del carrito exitosamente"
  }
}
```

---

### 6. Vaciar Carrito

Elimina todos los items del carrito.

**Endpoint:** `DELETE /api/v1/cart`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "message": "Carrito vaciado exitosamente"
  }
}
```

---

## Gestión de Órdenes

Base URL: `/api/v1/orders`

**Nota:** Todas las rutas de órdenes requieren autenticación.

### 1. Listar Órdenes

Obtiene las órdenes del usuario autenticado. Los administradores pueden ver todas las órdenes.

**Endpoint:** `GET /api/v1/orders`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `status` (opcional): Filtrar por estado (pending, processing, shipped, delivered, cancelled)

**Ejemplo:**
```
GET /api/v1/orders?page=1&limit=10&status=processing
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "order_date": "2024-01-01T00:00:00.000Z",
        "status": "processing",
        "subtotal": 2599.98,
        "tax": 259.99,
        "shipping_cost": 50.00,
        "total": 2909.97,
        "shipping_address": {
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001",
          "country": "USA"
        },
        "payment_method": "credit_card",
        "payment_status": "paid",
        "notes": "Entregar en la mañana",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "items": [
          {
            "id": "uuid",
            "order_id": "uuid",
            "product_id": "uuid",
            "quantity": 2,
            "price_at_purchase": 1299.99,
            "product": {
              "id": "uuid",
              "name": "Laptop Dell XPS 15",
              "sku": "DELL-XPS15-001",
              "image_url": "https://example.com/laptop.jpg"
            }
          }
        ]
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 2. Obtener Orden por ID

Obtiene información detallada de una orden específica.

**Endpoint:** `GET /api/v1/orders/:id`

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
    "order": {
      "id": "uuid",
      "user_id": "uuid",
      "order_date": "2024-01-01T00:00:00.000Z",
      "status": "processing",
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97,
      "shipping_address": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "payment_method": "credit_card",
      "payment_status": "paid",
      "notes": "Entregar en la mañana",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "order_id": "uuid",
          "product_id": "uuid",
          "quantity": 2,
          "price_at_purchase": 1299.99,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z",
          "product": {
            "id": "uuid",
            "name": "Laptop Dell XPS 15",
            "description": "Laptop de alto rendimiento",
            "sku": "DELL-XPS15-001",
            "price": 1299.99,
            "image_url": "https://example.com/laptop.jpg"
          }
        }
      ]
    }
  }
}
```

---

### 3. Crear Orden (Checkout)

Crea una nueva orden a partir del carrito del usuario.

**Endpoint:** `POST /api/v1/orders`

**Acceso:** Privado

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "shipping_address": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "payment_method": "credit_card",
  "notes": "Entregar en la mañana"
}
```

**Validaciones:**
- shipping_address.address: Requerido
- shipping_address.city: Requerido
- shipping_address.state: Requerido
- shipping_address.zip: Requerido
- shipping_address.country: Requerido
- payment_method: Requerido (credit_card, debit_card, paypal, bank_transfer, cash_on_delivery)
- notes: Opcional

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "user_id": "uuid",
      "order_date": "2024-01-01T00:00:00.000Z",
      "status": "pending",
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97,
      "shipping_address": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "payment_method": "credit_card",
      "payment_status": "pending",
      "notes": "Entregar en la mañana",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "order_id": "uuid",
          "product_id": "uuid",
          "quantity": 2,
          "price_at_purchase": 1299.99,
          "product": {
            "id": "uuid",
            "name": "Laptop Dell XPS 15",
            "sku": "DELL-XPS15-001",
            "image_url": "https://example.com/laptop.jpg"
          }
        }
      ]
    }
  },
  "meta": {
    "message": "Orden creada exitosamente"
  }
}
```

---

### 4. Actualizar Estado de Orden

Actualiza el estado de una orden (solo administradores).

**Endpoint:** `PATCH /api/v1/orders/:id/status`

**Acceso:** Privado (Solo Admin)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "status": "shipped"
}
```

**Validaciones:**
- status: Requerido (pending, processing, shipped, delivered, cancelled)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "user_id": "uuid",
      "order_date": "2024-01-01T00:00:00.000Z",
      "status": "shipped",
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97,
      "shipping_address": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "payment_method": "credit_card",
      "payment_status": "paid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-02T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Estado de orden actualizado exitosamente"
  }
}
```

---

### 5. Cancelar Orden

Cancela una orden (solo si está en estado pending o processing).

**Endpoint:** `POST /api/v1/orders/:id/cancel`

**Acceso:** Privado (Propietario)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "user_id": "uuid",
      "order_date": "2024-01-01T00:00:00.000Z",
      "status": "cancelled",
      "subtotal": 2599.98,
      "tax": 259.99,
      "shipping_cost": 50.00,
      "total": 2909.97,
      "shipping_address": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "USA"
      },
      "payment_method": "credit_card",
      "payment_status": "refunded",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-02T00:00:00.000Z"
    }
  },
  "meta": {
    "message": "Orden cancelada exitosamente"
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

