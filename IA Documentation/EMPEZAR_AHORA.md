# ⚡ Empezar Ahora - Configuración Rápida

## 🎯 Para iniciar el proyecto AHORA mismo

### Paso 1: Instalar Dependencias

```powershell
npm install
```

**Esto instalará:**
- Express (servidor web)
- PostgreSQL driver (pg)
- TypeScript y tipos
- Todas las herramientas necesarias

**Tiempo:** 2-3 minutos

---

### Paso 2: Configurar PostgreSQL

#### Opción A: Si ya tienes PostgreSQL instalado

1. **Abre pgAdmin** o **psql**

2. **Crea la base de datos:**
```sql
CREATE DATABASE davistore_db;
```

3. **Ejecuta el script de migración:**
   - En pgAdmin: 
     - Query Tool → Abrir archivo → `src/database/migrations/001_initial_schema.sql`
     - Ejecutar (F5)
   
   - En psql:
```powershell
psql -U postgres -d davistore_db -f src\database\migrations\001_initial_schema.sql
```

#### Opción B: Si NO tienes PostgreSQL

1. **Descarga PostgreSQL 14+:** https://www.postgresql.org/download/windows/
2. **Instala** con configuración por defecto
3. **Anota tu contraseña** de postgres
4. **Repite Opción A**

---

### Paso 3: Configurar Variables de Entorno

```powershell
# Copia el archivo de ejemplo
copy .env.example .env

# Abre el archivo (usa tu editor favorito)
notepad .env
```

**Edita SOLO estas líneas:**

```env
# IMPORTANTE: Cambia estos valores
DB_PASSWORD=tu_contraseña_de_postgres_aqui
JWT_SECRET=cambiar_esto_por_algo_seguro
JWT_REFRESH_SECRET=cambiar_esto_tambien
```

**Guarda y cierra.**

---

### Paso 4: ¡Iniciar el Servidor!

```powershell
npm run dev
```

**Verás:**
```
✅ Database connection established
✅ Server started successfully
📍 Environment: development
🌐 Server running on port 3000
🔗 API available at: http://localhost:3000/api/v1
❤️  Health check: http://localhost:3000/health
```

---

### Paso 5: Verificar que Funciona

**Abre tu navegador:** http://localhost:3000/health

**Deberías ver:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-14T...",
  "environment": "development"
}
```

**¡Todo funciona!** ✅

---

## 🚨 Solución de Problemas

### Error: "Cannot find module..."

```powershell
# Reinstala las dependencias
rmdir /s /q node_modules
npm install
```

### Error: "password authentication failed"

Tu contraseña de PostgreSQL en `.env` es incorrecta. Verifica:
```env
DB_PASSWORD=tu_contraseña_correcta
```

### Error: "database does not exist"

```powershell
# Crea la base de datos
psql -U postgres -c "CREATE DATABASE davistore_db;"
```

### Error: "Port 3000 is already in use"

Cambia el puerto en `.env`:
```env
PORT=3001
```

---

## 📚 Documentación Completa

Si quieres entender todo en detalle:

1. **README.md** - Documentación principal
2. **QUICK_START.md** - Guía paso a paso detallada
3. **DATABASE_DESIGN.md** - Diseño de base de datos
4. **BEST_PRACTICES.md** - Principios aplicados
5. **NEXT_STEPS.md** - Próximas implementaciones

---

## 🎯 Próximos Pasos Después de Iniciar

Una vez que el servidor esté corriendo:

### 1. Explorar la Base de Datos

```sql
-- Usuarios creados
SELECT * FROM users;

-- Categorías disponibles
SELECT * FROM categories;

-- Productos de ejemplo
SELECT * FROM products;
```

### 2. Probar los Endpoints

El servidor ya tiene configurado:
- ✅ Health check: `/health`
- ✅ API info: `/api/v1`
- ✅ Manejo de errores
- ✅ Logging
- ✅ CORS
- ✅ Seguridad (Helmet)

### 3. Implementar Autenticación (Siguiente Fase)

Ver **NEXT_STEPS.md** para el plan completo de implementación.

---

## 💡 Comandos Útiles

```powershell
# Modo desarrollo (con hot-reload)
npm run dev

# Compilar a JavaScript
npm run build

# Ejecutar versión compilada
npm start

# Linter (detectar problemas)
npm run lint

# Formatear código
npm run format

# Tests (cuando estén implementados)
npm test
```

---

## ✅ Checklist de Inicio

- [ ] Node.js instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos creada
- [ ] Migración ejecutada
- [ ] Archivo `.env` configurado
- [ ] Servidor inicia sin errores
- [ ] `/health` responde correctamente

**¿Completado?** ¡Felicidades! Estás listo para empezar a desarrollar. 🎉

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Lee el mensaje de error** completo
2. **Revisa la sección de troubleshooting** arriba
3. **Verifica QUICK_START.md** para más detalles
4. **Revisa los logs** en la consola

---

**¡Ahora sí, a codear!** 💻🚀

