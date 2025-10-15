# 🚀 Despliegue en Render - DaviStore Backend

**Tiempo:** 10 minutos  
**Costo:** $0 (Free tier)  
**Incluye:** PostgreSQL automático + Migraciones automáticas

---

## 📋 Pre-requisitos

- Cuenta en GitHub
- Código pusheado a tu repositorio
- Archivos de configuración (ya creados):
  - ✅ `render.yaml`
  - ✅ `setup-database.js`
  - ✅ `build.sh`

---

## 🎯 PASO 1: Preparar el Código

### Asegúrate de que los archivos estén commiteados:

```bash
cd Backend
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## 🌐 PASO 2: Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Clic en **"Get Started"**
3. Inicia sesión con **GitHub**
4. Autoriza Render para acceder a tus repos

---

## 🚀 PASO 3: Crear Nuevo Web Service

### Opción A: Usando Blueprint (Recomendado - MÁS FÁCIL)

1. En el Dashboard de Render, clic en **"New +"** → **"Blueprint"**
2. Conecta tu repositorio **DaviStore_APP**
3. Render detectará automáticamente el archivo `render.yaml`
4. Verás:
   - ✅ Web Service: `davistore-backend`
   - ✅ PostgreSQL Database: `davistore-db`
5. Clic en **"Apply"**
6. **¡Listo!** Render creará todo automáticamente

### Opción B: Manual (Si Blueprint no funciona)

#### 3.1 Crear Base de Datos

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Configurar:
   - **Name:** `davistore-db`
   - **Database:** `davistore`
   - **Plan:** Free
   - **Region:** Oregon (o el más cercano)
3. Clic en **"Create Database"**
4. Espera 2-3 minutos mientras se crea

#### 3.2 Crear Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Conecta tu repositorio **DaviStore_APP**
3. Configurar:

**Build & Deploy:**
- **Name:** `davistore-backend`
- **Region:** Oregon
- **Branch:** `main`
- **Root Directory:** `Backend`
- **Runtime:** Node
- **Build Command:** `chmod +x build.sh && ./build.sh`
- **Start Command:** `node dist/server.js`

**Plan:**
- Selecciona: **Free**

---

## 🔧 PASO 4: Configurar Variables de Entorno

En tu Web Service, ve a **Environment** y agrega:

### Variables Obligatorias:

```env
NODE_ENV=production
PORT=3000
```

### Database Connection:

1. Clic en **"Add Environment Variable"**
2. Selecciona **"Add from Database"**
3. Elige `davistore-db`
4. Selecciona **"Connection String"**
5. Render crea automáticamente: `DATABASE_URL`

### JWT Secrets (GENERA NUEVOS):

```env
JWT_SECRET=tu_super_secreto_seguro_de_64_caracteres_minimo_produccion
JWT_REFRESH_SECRET=otro_super_secreto_seguro_de_64_caracteres_minimo_refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Para generar secretos seguros:**
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### CORS (actualizar después con URL de Vercel):

```env
ALLOWED_ORIGINS=http://localhost:4200
```

---

## 📊 PASO 5: Monitorear el Despliegue

1. Render iniciará el build automáticamente
2. Verás los logs en tiempo real
3. Busca estas líneas para confirmar que las migraciones se ejecutaron:

```
🔨 Installing dependencies...
✓ Dependencies installed

🏗️  Building TypeScript...
✓ Build completed

🗄️  Running database migrations...
🔌 Conectando a la base de datos...
✅ Conectado exitosamente
📄 Ejecutando 001_initial_schema.sql...
✅ Migración 001 completada
📄 Ejecutando 002_add_order_statuses.sql...
✅ Migración 002 completada
🎉 Base de datos configurada exitosamente!

✅ Build completed successfully!

==> Starting service...
🚀 Server running on port 3000
```

---

## 🌍 PASO 6: Obtener URL Pública

1. El despliegue toma 5-10 minutos (primera vez)
2. Cuando termine, verás: **"Your service is live 🎉"**
3. Tu URL será algo como:
   ```
   https://davistore-backend.onrender.com
   ```
4. **GUARDA ESTA URL** - La necesitas para el frontend

---

## ✅ PASO 7: Verificar que Funciona

### Prueba la API:

```bash
# Verificar categorías
curl https://tu-app.onrender.com/api/v1/categories

# Deberías ver:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Electrónica",
      "slug": "electronica",
      ...
    }
  ]
}
```

### Verificar Base de Datos:

1. En Render → Tu base de datos → **"Connect"**
2. Copia el comando PSQL
3. Ejecuta en tu terminal:
   ```bash
   psql <connection_string>
   ```
4. Verifica tablas:
   ```sql
   \dt
   SELECT * FROM roles;
   SELECT * FROM categories;
   ```

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Síntoma:** El build se detiene con errores

**Solución:**
1. Verifica que `build.sh` tenga permisos: `chmod +x build.sh`
2. En Render, Build Command debe ser: `chmod +x build.sh && ./build.sh`
3. Si falla en Windows, usa: `npm ci && npm run build && node setup-database.js`

### Error: "Cannot connect to database"

**Síntoma:** Migraciones fallan con error de conexión

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada
2. Render debe crearla automáticamente desde la base de datos
3. Ve a Environment → Add from Database

### Error: "Migrations not running"

**Síntoma:** No ves logs de migraciones

**Solución:**
1. Verifica que `setup-database.js` esté en el root de Backend
2. Verifica que `build.sh` incluya: `node setup-database.js`
3. Redeploy manualmente: **Manual Deploy** → **Clear build cache & deploy**

### Error: "Port already in use"

**Síntoma:** El servidor no inicia

**Solución:**
1. Render usa la variable `PORT` automáticamente
2. Tu código debe leer: `process.env.PORT || 3000`
3. Verifica `src/server.ts` o `src/index.ts`

---

## 🔄 Actualizar en el Futuro

Cada vez que hagas `git push`:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render detecta el cambio y **redespliega automáticamente**. Las migraciones se ejecutan en cada deploy.

---

## 📈 Monitoreo y Logs

### Ver Logs en Tiempo Real:

1. Render → Tu Web Service → **Logs**
2. Filtra por tipo: All, Deploy, Runtime

### Métricas:

1. Render → Tu Web Service → **Metrics**
2. Verás: CPU, Memory, Response time

### Base de Datos:

1. Render → Tu Database → **Metrics**
2. Verás: Connections, Size, Queries

---

## ⚙️ Configuración Avanzada

### Health Checks:

Render verifica automáticamente `/api/v1/categories` cada 30 segundos.

### Auto-Deploy:

Por defecto, Render despliega automáticamente en cada push a `main`.

Para desactivar:
1. Settings → **Auto-Deploy**: Off

### Branch Previews:

Puedes crear previews de otras ramas:
1. Settings → **Pull Request Previews**: Enable

---

## 💰 Costos (Free Tier)

**Web Service (Free):**
- 750 horas/mes gratis
- Se duerme después de 15 min de inactividad
- Tarda ~30 segundos en despertar (primera petición)

**PostgreSQL (Free):**
- 1 GB de almacenamiento
- 90 días de backups
- Expira después de 90 días (debes recrearla)

**Para evitar que se duerma:**
- Upgrade a plan Starter ($7/mes) para servicio 24/7
- O usa un servicio de "keep alive" (ping cada 10 min)

---

## 🎯 Próximos Pasos

Una vez que tu backend esté funcionando en Render:

1. **Guarda tu URL:** `https://tu-app.onrender.com`
2. **Ve a Frontend:** Sigue la guía para desplegar en Vercel
3. **Actualiza CORS:** Agrega la URL de Vercel en `ALLOWED_ORIGINS`

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

<div align="center">

**🚀 Backend desplegado en Render con éxito!**

*Base de datos con migraciones ejecutadas automáticamente*

*Desarrollado por Jhoan Sebastian Wilches Jimenez*

</div>

