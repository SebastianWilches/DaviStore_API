# 📬 Guía de Postman para DaviStore API

## 📦 Archivos Incluidos

1. **`postman_collection.json`** - Colección con todos los endpoints
2. **`postman_environment.json`** - Variables de entorno para local

---

## 🚀 Cómo Importar en Postman

### Paso 1: Importar la Colección

1. Abre Postman
2. Haz clic en **"Import"** (esquina superior izquierda)
3. Arrastra el archivo `postman_collection.json` o haz clic en **"Upload Files"**
4. Selecciona el archivo y haz clic en **"Import"**

✅ Verás una nueva colección llamada **"DaviStore API"**

### Paso 2: Importar el Environment (Opcional pero recomendado)

1. Haz clic en **"Import"** nuevamente
2. Arrastra el archivo `postman_environment.json`
3. Haz clic en **"Import"**

✅ Verás un nuevo environment llamado **"DaviStore - Local"**

### Paso 3: Seleccionar el Environment

1. En la esquina superior derecha, busca el dropdown que dice "No Environment"
2. Selecciona **"DaviStore - Local"**

✅ Ahora todas las variables estarán disponibles

---

## 🎯 Cómo Usar la Colección

### Variables Automáticas

La colección incluye scripts que **automáticamente guardan**:
- ✅ `access_token` - Se guarda al hacer login o registro
- ✅ `refresh_token` - Se guarda al hacer login o registro
- ✅ `user_id` - Se guarda al hacer login o registro

Esto significa que **no necesitas copiar/pegar tokens manualmente**. 🎉

### Flujo de Prueba Recomendado

#### 1️⃣ **Registro de Usuario**

```
📁 Autenticación → 1. Registrar Usuario
```

- Ejecuta este request
- Los tokens se guardarán automáticamente
- Ahora puedes usar endpoints protegidos

#### 2️⃣ **Ver tu Perfil**

```
📁 Autenticación → 4. Obtener Usuario Actual
```

- Este endpoint usa el token guardado automáticamente
- Deberías ver tu información

#### 3️⃣ **Probar como Admin**

```
📁 Autenticación → 3. Login Admin
```

**Credenciales por defecto:**
- Email: `admin@davistore.com`
- Password: `Admin123!`

- Los tokens de admin se guardarán automáticamente
- Ahora puedes probar endpoints de admin

#### 4️⃣ **Listar Usuarios (Admin)**

```
📁 Usuarios → 1. Listar Usuarios (Admin)
```

- Solo funciona si estás logueado como admin
- Prueba con diferentes query parameters:
  - `?page=1&limit=10`
  - `?search=juan`
  - `?isActive=true`

---

## 📝 Estructura de la Colección

### 📁 Autenticación (6 endpoints)
- **1. Registrar Usuario** - Crea cuenta nueva
- **2. Iniciar Sesión** - Login normal
- **3. Login Admin** - Login como administrador
- **4. Obtener Usuario Actual** - Tu perfil
- **5. Refrescar Token** - Renueva access token
- **6. Cerrar Sesión** - Logout

### 📁 Usuarios (3 endpoints)
- **1. Listar Usuarios (Admin)** - Lista con paginación
- **2. Obtener Usuario por ID** - Ver un usuario
- **3. Actualizar Usuario** - Actualizar campos

### 📁 Categorías (8 endpoints)
- **1. Listar Categorías** - Todas las categorías (público)
- **2. Árbol de Categorías** - Vista jerárquica (público)
- **3. Obtener por ID** - Ver una categoría
- **4. Obtener por Slug** - Buscar por slug
- **5. Crear Categoría** - Nueva categoría (admin)
- **6. Crear Subcategoría** - Con parent_id (admin)
- **7. Actualizar Categoría** - Editar (admin)
- **8. Eliminar Categoría** - Borrar (admin)

### 📁 Productos (9 endpoints)
- **1. Listar Productos** - Con filtros y paginación (público)
- **2. Buscar Productos** - Por nombre/descripción/SKU
- **3. Filtrar por Categoría y Precio** - Múltiples filtros
- **4. Obtener por ID** - Ver un producto
- **5. Obtener por SKU** - Buscar por SKU
- **6. Crear Producto** - Nuevo producto (admin)
- **7. Actualizar Producto** - Editar (admin)
- **8. Actualizar Stock** - Solo cantidad (admin)
- **9. Eliminar Producto** - Borrar (admin)

### 📁 Carrito (7 endpoints)
- **1. Ver Mi Carrito** - Carrito completo con items
- **2. Resumen del Carrito** - Totales rápidos
- **3. Agregar Producto** - Añadir al carrito
- **4. Agregar Otro Producto** - Ejemplo adicional
- **5. Actualizar Cantidad** - Cambiar cantidad de item
- **6. Eliminar Item** - Quitar producto del carrito
- **7. Vaciar Carrito** - Eliminar todos los items

### 📁 Órdenes (8 endpoints)
- **1. Crear Orden (Checkout)** - Procesar compra
- **2. Listar Mis Órdenes** - Ver mis compras
- **3. Listar Todas (Admin)** - Ver todas las órdenes
- **4. Filtrar Órdenes** - Por estado
- **5. Obtener por ID** - Ver orden completa
- **6. Actualizar a Processing** - Cambiar estado (admin)
- **7. Actualizar a Completed** - Marcar completada (admin)
- **8. Cancelar Orden** - Cancelar compra (usuario)

### 📁 Ejemplos de Errores (6 ejemplos)
- **Error 400** - Validación fallida
- **Error 401** - Token inválido
- **Error 403** - Sin permisos
- **Error 404** - No encontrado
- **Error 409** - SKU duplicado
- **Error 422** - Stock insuficiente

---

## 🔑 Variables de Colección

Estas variables se configuran automáticamente:

| Variable | Descripción | Se llena en |
|----------|-------------|-------------|
| `base_url` | URL base de la API | Manual/Environment |
| `access_token` | Token de acceso | Login/Registro |
| `refresh_token` | Token de refresco | Login/Registro |
| `user_id` | ID del usuario actual | Login/Registro |
| `category_id` | ID de categoría (para pruebas) | Crear Categoría |
| `product_id` | ID de producto (para pruebas) | Crear Producto |
| `cart_item_id` | ID de item del carrito | Agregar al Carrito |
| `order_id` | ID de orden (para pruebas) | Crear Orden |

### Cómo Ver las Variables

1. Haz clic en la colección **"DaviStore API"**
2. Ve a la pestaña **"Variables"**
3. Verás los valores actuales

---

## 🧪 Casos de Prueba

### Caso 1: Flujo Completo de Compra 🛒

**Objetivo:** Simular una compra completa desde el registro hasta la orden

1. **Registrar como admin**
   ```
   Autenticación → 3. Login Admin
   ```

2. **Crear categoría**
   ```
   Categorías → 5. Crear Categoría (Admin)
   ```
   - Se guarda automáticamente el `category_id`

3. **Crear producto**
   ```
   Productos → 6. Crear Producto (Admin)
   ```
   - Se guarda automáticamente el `product_id`

4. **Registrar usuario normal**
   ```
   Autenticación → 1. Registrar Usuario
   ```
   - Se guardan los tokens del usuario

5. **Ver productos disponibles**
   ```
   Productos → 1. Listar Productos (Público)
   ```

6. **Agregar producto al carrito**
   ```
   Carrito → 3. Agregar Producto al Carrito
   ```

7. **Ver carrito**
   ```
   Carrito → 1. Ver Mi Carrito
   ```

8. **Hacer checkout**
   ```
   Órdenes → 1. Crear Orden (Checkout)
   ```
   - Se crea la orden
   - Se reduce el stock automáticamente
   - Se guarda el `order_id`

9. **Ver orden creada**
   ```
   Órdenes → 5. Obtener Orden por ID
   ```

✅ **Resultado:** Compra completa exitosa

---

### Caso 2: Gestión de Productos (Admin)

1. **Login como admin**
   ```
   Autenticación → 3. Login Admin
   ```

2. **Crear categoría padre**
   ```
   Categorías → 5. Crear Categoría (Admin)
   Body: { "name": "Electrónica", "slug": "electronica" }
   ```

3. **Crear subcategoría**
   ```
   Categorías → 6. Crear Subcategoría (Admin)
   Body: { "name": "Laptops", "slug": "laptops", "parent_id": "{{category_id}}" }
   ```

4. **Ver árbol de categorías**
   ```
   Categorías → 2. Árbol de Categorías (Público)
   ```

5. **Crear varios productos**
   ```
   Productos → 6. Crear Producto (Admin)
   - Producto 1: SKU LAP-001
   - Producto 2: SKU LAP-002
   - Producto 3: SKU LAP-003
   ```

6. **Buscar productos**
   ```
   Productos → 2. Buscar Productos
   Query: ?search=laptop
   ```

7. **Filtrar por precio**
   ```
   Productos → 3. Filtrar por Categoría y Precio
   Query: ?minPrice=500&maxPrice=2000
   ```

8. **Actualizar stock**
   ```
   Productos → 8. Actualizar Stock (Admin)
   Body: { "quantity": 50 }
   ```

---

### Caso 3: Gestión de Carrito

1. **Login como usuario**
   ```
   Autenticación → 2. Iniciar Sesión
   ```

2. **Agregar múltiples productos**
   ```
   Carrito → 3. Agregar Producto al Carrito
   - Producto A: cantidad 2
   - Producto B: cantidad 1
   - Producto C: cantidad 3
   ```

3. **Ver carrito completo**
   ```
   Carrito → 1. Ver Mi Carrito
   ```

4. **Ver resumen rápido**
   ```
   Carrito → 2. Resumen del Carrito
   ```

5. **Actualizar cantidad**
   ```
   Carrito → 5. Actualizar Cantidad de Item
   Body: { "quantity": 5 }
   ```

6. **Eliminar un item**
   ```
   Carrito → 6. Eliminar Item del Carrito
   ```

7. **Vaciar carrito** (opcional)
   ```
   Carrito → 7. Vaciar Carrito
   ```

---

### Caso 4: Gestión de Órdenes (Admin)

1. **Login como admin**
   ```
   Autenticación → 3. Login Admin
   ```

2. **Ver todas las órdenes**
   ```
   Órdenes → 3. Listar Todas las Órdenes (Admin)
   ```

3. **Filtrar órdenes pendientes**
   ```
   Órdenes → 4. Filtrar Órdenes Pendientes
   Query: ?status=pending
   ```

4. **Procesar orden**
   ```
   Órdenes → 6. Actualizar Estado a Processing (Admin)
   Body: { "status": "processing" }
   ```

5. **Completar orden**
   ```
   Órdenes → 7. Actualizar Estado a Completed (Admin)
   Body: { "status": "completed" }
   ```

---

### Caso 5: Cancelación de Orden

1. **Usuario hace una compra** (seguir Caso 1)

2. **Usuario decide cancelar**
   ```
   Órdenes → 8. Cancelar Orden (Usuario)
   ```
   - Solo funciona si la orden está en "pending"
   - El stock se restaura automáticamente

3. **Verificar stock restaurado**
   ```
   Productos → 4. Obtener Producto por ID
   ```
   - El stock debe ser el original

---

### Caso 6: Pruebas de Validación

1. **Intentar crear producto sin SKU** ❌
   ```
   Productos → 6. Crear Producto (Admin)
   Body: Sin campo "sku"
   ```
   - Error 400: "El SKU es requerido"

2. **Intentar agregar más stock del disponible** ❌
   ```
   Carrito → 3. Agregar Producto al Carrito
   Body: { "product_id": "xxx", "quantity": 9999 }
   ```
   - Error 422: "Stock insuficiente"

3. **Intentar crear categoría con slug duplicado** ❌
   ```
   Categorías → 5. Crear Categoría (Admin)
   Body: { "slug": "electronica" } (ya existe)
   ```
   - Error 409: "El slug ya está en uso"

4. **Usuario normal intenta crear producto** ❌
   ```
   Productos → 6. Crear Producto (Admin)
   (con token de usuario normal)
   ```
   - Error 403: "Acceso denegado"

---

### Caso 7: Refresh Token

1. **Login normal**
   ```
   Autenticación → 2. Iniciar Sesión
   ```

2. **Esperar 16 minutos** (access token expira)

3. **Intentar acceder a recurso protegido** ❌
   ```
   Autenticación → 4. Obtener Usuario Actual
   ```
   - Debería dar error 401

4. **Refrescar token** ✅
   ```
   Autenticación → 5. Refrescar Token
   ```

5. **Volver a intentar acceso**
   ```
   Autenticación → 4. Obtener Usuario Actual
   ```
   - Ahora debería funcionar

---

## 🎨 Personalización

### Cambiar Base URL

**Opción 1: En el Environment**
1. Haz clic en el ícono del ojo (esquina superior derecha)
2. Haz clic en **"DaviStore - Local"**
3. Edita `base_url` a tu URL deseada

**Opción 2: En la Colección**
1. Haz clic en la colección **"DaviStore API"**
2. Ve a **"Variables"**
3. Edita `base_url`

### Agregar Más Ambientes

Puedes crear environments adicionales:

**DaviStore - Development**
```json
{
  "base_url": "https://dev-api.davistore.com/api/v1"
}
```

**DaviStore - Production**
```json
{
  "base_url": "https://api.davistore.com/api/v1"
}
```

---

## 🛠️ Tips y Trucos

### 1. Ver el Token Guardado

```javascript
// En la consola de Postman
console.log(pm.collectionVariables.get('access_token'));
```

### 2. Limpiar Tokens

En cualquier request, ve a la pestaña **"Pre-request Script"** y agrega:

```javascript
pm.collectionVariables.set('access_token', '');
pm.collectionVariables.set('refresh_token', '');
```

### 3. Exportar Variables

Cuando cierres Postman, las variables se mantienen. Si quieres compartirlas:

1. Haz clic en el environment
2. Tres puntos (⋯) → **"Export"**
3. Guarda el archivo JSON

### 4. Scripts de Test

Los requests de login ya incluyen scripts que:
- Guardan tokens automáticamente
- Muestran mensajes en la consola
- Validan códigos de respuesta

### 5. Ejecutar en Colección

Puedes ejecutar toda la colección de una vez:

1. Haz clic en la colección
2. Clic en **"Run"**
3. Selecciona los requests que quieres ejecutar
4. Clic en **"Run DaviStore API"**

---

## 🐛 Solución de Problemas

### ❌ "Cannot GET /api/v1/auth/register"

**Problema:** El servidor no está corriendo

**Solución:**
```bash
npm run dev
```

### ❌ "Error: connect ECONNREFUSED"

**Problema:** La URL es incorrecta o el servidor no está disponible

**Solución:**
1. Verifica que el servidor esté corriendo
2. Verifica la `base_url` en las variables

### ❌ "401 Unauthorized"

**Problema:** Token expirado o inválido

**Solución:**
1. Haz login nuevamente
2. O usa refresh token

### ❌ "403 Forbidden"

**Problema:** No tienes permisos para ese endpoint

**Solución:**
1. Verifica si el endpoint requiere rol de admin
2. Haz login con usuario admin si es necesario

---

## 📚 Recursos Adicionales

- **Documentación completa:** Ver `API_ENDPOINTS.md`
- **Variables de entorno:** Ver `ENV_SETUP.md`
- **Resumen técnico:** Ver `RESUMEN_AUTENTICACION.md`

---

## ✅ Checklist de Inicio Rápido

- [ ] Importar `postman_collection.json`
- [ ] Importar `postman_environment.json`
- [ ] Seleccionar environment "DaviStore - Local"
- [ ] Asegurarte que el servidor esté corriendo (`npm run dev`)
- [ ] Probar "Health Check"
- [ ] Registrar un usuario o hacer login como admin
- [ ] Probar endpoints protegidos

---

¡Listo! Ahora puedes probar todos los endpoints de forma fácil y rápida. 🚀

