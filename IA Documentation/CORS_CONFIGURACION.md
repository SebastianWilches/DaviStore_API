# 🔧 Configuración de CORS - DaviStore Backend

## ✅ Problema Solucionado

Se ha configurado CORS para permitir peticiones desde el frontend de Angular.

---

## 🔴 Qué era el problema

El frontend de Angular (corriendo en `http://localhost:4200`) no podía hacer peticiones al backend (en `http://localhost:3000`) debido a la política de seguridad CORS (Cross-Origin Resource Sharing).

**Error original:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/v1/auth/register' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

---

## ✅ Solución Implementada

Se actualizó el archivo `src/config/env.ts` para incluir el puerto 4200 de Angular en los orígenes permitidos:

```typescript
// Antes:
allowedOrigins: parseArray(
  getEnv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173')
),

// Ahora:
allowedOrigins: parseArray(
  getEnv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:4200,http://localhost:5173')
),
```

---

## 🚀 Cómo Aplicar los Cambios

### Paso 1: Reiniciar el Backend

**IMPORTANTE:** Debes reiniciar el servidor del backend para que los cambios surtan efecto.

```bash
# En la terminal del backend
# Detén el servidor con Ctrl+C

# Luego reinicia:
cd Backend
npm run dev
```

### Paso 2: Verificar que funcione

Deberías ver un mensaje como:
```
✅ Configuration validated successfully
🗄️  Database connected successfully
🚀 Server running on port 3000
```

### Paso 3: Probar el Frontend

Ahora el registro debería funcionar correctamente:

```bash
# En otra terminal
cd Frontend/davistore-app
npm start

# Abre http://localhost:4200/register
```

---

## 📝 Orígenes Permitidos Actualmente

El backend ahora acepta peticiones desde:

- ✅ `http://localhost:3000` - Backend (para testing, swagger, etc.)
- ✅ `http://localhost:4200` - **Angular Frontend** ← NUEVO
- ✅ `http://localhost:5173` - Vite/React (por si usas otro framework)

---

## 🔒 Configuración Avanzada (Opcional)

Si quieres personalizar los orígenes permitidos, puedes crear un archivo `.env` en la raíz del Backend:

### Crear archivo `.env`

```bash
cd Backend
# Crear archivo .env (Windows)
New-Item .env -ItemType File

# O en bash/Linux
touch .env
```

### Contenido del `.env`

```env
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200,http://localhost:5173,https://tu-dominio.com

# Otras configuraciones importantes
DB_PASSWORD=tu_password_de_postgresql
JWT_SECRET=un_secreto_largo_y_aleatorio_aqui
JWT_REFRESH_SECRET=otro_secreto_diferente_aqui
```

**⚠️ IMPORTANTE:**
- El archivo `.env` NO debe ser commiteado a Git (ya está en `.gitignore`)
- Cambia los secretos JWT en producción
- Usa el password correcto de tu PostgreSQL

---

## 🌐 Para Producción

Cuando despliegues a producción, actualiza los orígenes permitidos:

```env
# Ejemplo para producción
ALLOWED_ORIGINS=https://tu-frontend.com,https://www.tu-frontend.com
```

O directamente en las variables de entorno del servidor (Heroku, Vercel, AWS, etc.)

---

## 🔍 Cómo Verificar la Configuración Actual

Puedes ver los orígenes permitidos accediendo a:

```
GET http://localhost:3000/health
```

O en el código del servidor al iniciar, verás un log con la configuración.

---

## ❓ Problemas Comunes

### 1. "Aún me da error de CORS"

**Solución:** Asegúrate de haber reiniciado el backend con `npm run dev`

### 2. "Error de conexión refused"

**Solución:** Verifica que el backend esté corriendo en el puerto 3000:
```bash
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux
```

### 3. "Error de Base de Datos"

**Solución:** Asegúrate de que PostgreSQL esté corriendo y la configuración de DB sea correcta en `.env`

---

## 📚 Más Información

- [Documentación de CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [Express CORS Package](https://www.npmjs.com/package/cors)

---

**¡El problema de CORS está solucionado! Solo reinicia el backend y listo.** 🎉

