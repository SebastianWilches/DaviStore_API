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

### 📁 Autenticación
- **1. Registrar Usuario** - Crea cuenta nueva
- **2. Iniciar Sesión** - Login normal
- **3. Login Admin** - Login como administrador
- **4. Obtener Usuario Actual** - Tu perfil
- **5. Refrescar Token** - Renueva access token
- **6. Cerrar Sesión** - Logout

### 📁 Usuarios
- **1. Listar Usuarios (Admin)** - Lista con paginación
- **2. Obtener Usuario por ID** - Ver un usuario
- **3. Actualizar Usuario** - Actualizar todos los campos
- **4. Actualizar Email** - Solo email
- **5. Cambiar Contraseña** - Solo password
- **6. Activar Usuario (Admin)** - Activar
- **7. Desactivar Usuario (Admin)** - Desactivar
- **8. Eliminar Usuario (Admin)** - Soft delete

### 📁 Ejemplos de Errores
- **Error 400** - Validación fallida
- **Error 401** - No autenticado
- **Error 403** - Sin permisos
- **Error 404** - No encontrado
- **Error 409** - Conflicto (duplicado)

---

## 🔑 Variables de Colección

Estas variables se configuran automáticamente:

| Variable | Descripción | Se llena en |
|----------|-------------|-------------|
| `base_url` | URL base de la API | Manual/Environment |
| `access_token` | Token de acceso | Login/Registro |
| `refresh_token` | Token de refresco | Login/Registro |
| `user_id` | ID del usuario actual | Login/Registro |

### Cómo Ver las Variables

1. Haz clic en la colección **"DaviStore API"**
2. Ve a la pestaña **"Variables"**
3. Verás los valores actuales

---

## 🧪 Casos de Prueba

### Caso 1: Usuario Normal

1. **Registrar nuevo usuario**
   ```
   Autenticación → 1. Registrar Usuario
   ```

2. **Ver mi perfil**
   ```
   Autenticación → 4. Obtener Usuario Actual
   ```

3. **Actualizar mi información**
   ```
   Usuarios → 3. Actualizar Usuario
   ```

4. **Intentar listar todos los usuarios** ❌
   ```
   Usuarios → 1. Listar Usuarios (Admin)
   ```
   - Debería dar error 403 (Forbidden)

### Caso 2: Administrador

1. **Login como admin**
   ```
   Autenticación → 3. Login Admin
   ```

2. **Listar todos los usuarios** ✅
   ```
   Usuarios → 1. Listar Usuarios (Admin)
   ```

3. **Desactivar un usuario**
   ```
   Usuarios → 7. Desactivar Usuario (Admin)
   ```
   - Cambia el `{{user_id}}` en la URL por un ID real

4. **Activar un usuario**
   ```
   Usuarios → 6. Activar Usuario (Admin)
   ```

### Caso 3: Refresh Token

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

