# 🚀 Guía de Despliegue - DaviStore

Esta guía te llevará paso a paso para desplegar DaviStore en producción.

---

## 🎯 Opción Recomendada: Railway + Vercel

**Backend:** Railway (incluye PostgreSQL automático)  
**Frontend:** Vercel (especializado en Angular/React)  
**Costo:** Gratis (con límites generosos)  
**Tiempo:** 10-15 minutos

---

## 📦 PARTE 1: Desplegar Backend en Railway

### **Paso 1: Crear cuenta en Railway**

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con GitHub

### **Paso 2: Crear proyecto nuevo**

1. Clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona el repositorio **DaviStore_APP**
4. Railway detectará automáticamente que es un proyecto Node.js

### **Paso 3: Agregar PostgreSQL**

1. En tu proyecto de Railway, clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. **IMPORTANTE:** Railway auto-conecta la DB con la variable `DATABASE_URL`

### **Paso 4: Configurar Variables de Entorno**

En Railway, ve a tu servicio de backend → **Variables**:

```env
# Node
NODE_ENV=production
PORT=3000

# Database (AUTO-GENERADA por Railway, NO la cambies)
DATABASE_URL=postgresql://... (Railway la crea automáticamente)

# JWT Secrets (GENERA NUEVOS, NO USES ESTOS)
JWT_SECRET=tu_super_secreto_seguro_produccion_12345
JWT_REFRESH_SECRET=tu_refresh_secreto_seguro_produccion_67890
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Actualizar después con URL de Vercel)
ALLOWED_ORIGINS=http://localhost:4200,https://tu-app.vercel.app
```

**Generar secretos seguros:**
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Paso 5: Configurar el Root Directory**

1. En Railway, ve a **Settings** → **Root Directory**
2. Configura: `Backend`
3. Guarda cambios

### **Paso 6: Configurar Build Command**

Railway debería detectar automáticamente los comandos, pero verifica:

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `node dist/server.js`

### **Paso 7: Desplegar**

1. Railway iniciará el despliegue automáticamente
2. Monitorea los logs en tiempo real
3. El script `setup-database.js` ejecutará automáticamente las migraciones
4. Verás en los logs:
   ```
   🔌 Conectando a la base de datos...
   ✅ Conectado exitosamente
   📄 Ejecutando 001_initial_schema.sql...
   ✅ Migración 001 completada
   📄 Ejecutando 002_add_order_statuses.sql...
   ✅ Migración 002 completada
   🎉 Base de datos configurada exitosamente!
   ```

### **Paso 8: Obtener URL Pública**

1. En Railway, ve a **Settings** → **Networking**
2. Clic en **"Generate Domain"**
3. Obtendrás algo como: `https://davistore-backend-production.up.railway.app`
4. **GUARDA ESTA URL** - La necesitarás para el frontend

### **Paso 9: Verificar Despliegue**

Prueba tu API:
```bash
# Verificar que está funcionando
curl https://tu-app.railway.app/api/v1/categories

# Debería retornar las categorías
```

---

## 🎨 PARTE 2: Desplegar Frontend en Vercel

### **Paso 1: Actualizar URL de API**

Actualiza la URL del backend en tu proyecto Angular:

```typescript
// Frontend/davistore-app/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-app.railway.app/api/v1'  // URL de Railway
};
```

### **Paso 2: Crear cuenta en Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Inicia sesión con GitHub

### **Paso 3: Importar Proyecto**

1. Clic en **"Add New Project"**
2. Selecciona el repositorio **DaviStore_APP**
3. Vercel detectará automáticamente que es Angular

### **Paso 4: Configurar Proyecto**

- **Framework Preset:** Angular
- **Root Directory:** `Frontend/davistore-app`
- **Build Command:** `npm run build` (o deja el default)
- **Output Directory:** `dist/davistore-app/browser` (Angular 18)

### **Paso 5: Configurar Variables de Entorno** (Opcional)

Si tienes otras variables, agrégalas en Vercel → **Settings** → **Environment Variables**

### **Paso 6: Desplegar**

1. Clic en **"Deploy"**
2. Vercel compilará y desplegará tu app
3. Obtendrás una URL como: `https://davistore.vercel.app`

### **Paso 7: Actualizar CORS en Backend**

Vuelve a Railway y actualiza la variable `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://davistore.vercel.app
```

**Redeploy** en Railway para aplicar cambios.

---

## ✅ VERIFICACIÓN FINAL

### **1. Verificar Backend:**
```bash
curl https://tu-app.railway.app/api/v1/categories
```

### **2. Verificar Frontend:**
Abre `https://tu-app.vercel.app` en tu navegador

### **3. Verificar Integración:**
1. Abre tu app en Vercel
2. Intenta hacer login con:
   - Email: `admin@davistore.com`
   - Password: `Admin123!`
3. Si funciona, ¡todo está correcto! 🎉

---

## 🔧 Solución de Problemas

### **Error: CORS**
Si ves errores de CORS en la consola del navegador:
1. Verifica que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel
2. Redeploy en Railway

### **Error: Cannot connect to database**
1. Verifica que `DATABASE_URL` esté configurada en Railway
2. Railway la genera automáticamente al agregar PostgreSQL
3. Revisa los logs: `npm run db:setup` debe ejecutarse sin errores

### **Error: Migrations not running**
Ejecuta manualmente desde Railway CLI:
```bash
railway run npm run db:setup
```

### **Frontend: API calls failing**
1. Verifica `environment.prod.ts` tenga la URL correcta
2. Redeploy en Vercel
3. Abre DevTools → Network para ver los requests

---

## 🌐 URLs del Proyecto

Después del despliegue, tendrás:

- **Frontend:** `https://tu-app.vercel.app`
- **Backend API:** `https://tu-app.railway.app/api/v1`
- **PostgreSQL:** Privado en Railway (solo accesible por el backend)

---

## 📊 Monitoreo

### **Railway (Backend + DB)**
- **Logs:** Railway → Tu servicio → Logs
- **Métricas:** Railway → Tu servicio → Metrics
- **Database:** Railway → PostgreSQL → Data (para ver tablas)

### **Vercel (Frontend)**
- **Analytics:** Vercel → Tu proyecto → Analytics
- **Logs:** Vercel → Tu proyecto → Deployments → View Function Logs

---

## 🔄 Actualizar Despliegues

### **Backend:**
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway detecta el push y redespliega automáticamente.

### **Frontend:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel detecta el push y redespliega automáticamente.

---

## 💰 Costos

### **Railway (Free Tier)**
- $5 de créditos gratis al mes
- Suficiente para desarrollo y proyectos pequeños
- Incluye PostgreSQL sin costo adicional

### **Vercel (Free Tier)**
- 100 GB de ancho de banda
- Builds ilimitados
- Dominio personalizado gratis

**Total:** $0/mes para proyectos pequeños 🎉

---

## 🎓 Recursos Adicionales

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

---

## 👨‍💻 Soporte

Si tienes problemas:
1. Revisa los logs en Railway y Vercel
2. Verifica las variables de entorno
3. Asegúrate de que las migraciones se ejecutaron correctamente

---

<div align="center">

**🚀 ¡Tu DaviStore está en producción!**

*Desarrollado por Jhoan Sebastian Wilches Jimenez*

</div>

