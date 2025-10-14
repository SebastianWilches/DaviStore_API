# 🚀 Guía de Inicio Rápido - DaviStore Backend

Esta guía te ayudará a configurar el proyecto en menos de 10 minutos.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- ✅ **PostgreSQL** >= 14.x ([Descargar](https://www.postgresql.org/download/))
- ✅ **Git** ([Descargar](https://git-scm.com/downloads))
- ✅ **Editor de código** (VS Code recomendado)

---

## 🛠️ Paso 1: Clonar e Instalar Dependencias

```bash
# 1. Navega al directorio del proyecto
cd C:\Proyectos\Sebas\DaviStore\Backend

# 2. Instala las dependencias
npm install
```

**Tiempo estimado:** 2-3 minutos

---

## 🗄️ Paso 2: Configurar PostgreSQL

### Opción A: Usando pgAdmin (GUI)

1. Abre **pgAdmin**
2. Conéctate a tu servidor PostgreSQL
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `davistore_db`
5. Click "Save"

### Opción B: Usando Terminal/CMD

```bash
# 1. Conéctate a PostgreSQL
psql -U postgres

# 2. Crea la base de datos
CREATE DATABASE davistore_db;

# 3. Verifica que se creó
\l

# 4. Sal de psql
\q
```

**Tiempo estimado:** 1 minuto

---

## 🔧 Paso 3: Configurar Variables de Entorno

```bash
# 1. Copia el archivo de ejemplo
copy .env.example .env

# 2. Abre .env con tu editor
notepad .env   # o code .env si usas VS Code
```

**Edita los siguientes valores:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=davistore_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI  # ⚠️ IMPORTANTE: Cambia esto

# JWT Configuration
JWT_SECRET=mi_clave_secreta_super_segura_cambiar_en_produccion
JWT_REFRESH_SECRET=mi_clave_refresh_super_segura_cambiar_en_produccion
```

**Tiempo estimado:** 2 minutos

---

## 📊 Paso 4: Ejecutar Migraciones (Crear Tablas)

### Opción A: Desde pgAdmin

1. En pgAdmin, selecciona la base de datos `davistore_db`
2. Click en "Query Tool" (ícono de rayo)
3. Abre el archivo: `src/database/migrations/001_initial_schema.sql`
4. Copia todo el contenido al Query Tool
5. Click en "Execute" (F5)

### Opción B: Desde Terminal

```bash
# Ejecuta el script de migración
psql -U postgres -d davistore_db -f src/database/migrations/001_initial_schema.sql
```

**Deberías ver:** ✅ "Database schema created successfully!"

**Tiempo estimado:** 1 minuto

---

## ✅ Paso 5: Verificar la Instalación

```bash
# Verifica que las tablas se crearon correctamente
psql -U postgres -d davistore_db -c "\dt"
```

**Deberías ver 8 tablas:**
```
 users
 categories
 products
 carts
 cart_items
 orders
 order_items
 payments
```

---

## 🎯 Paso 6: Ejecutar el Servidor (Una vez completada la implementación)

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# El servidor se iniciará en: http://localhost:3000
```

---

## 🧪 Verificación de Datos Iniciales

La migración incluye datos de ejemplo. Verifica que se cargaron:

### 1. Usuario Administrador

```sql
-- Ejecuta en psql o pgAdmin
SELECT email, role FROM users WHERE role = 'admin';
```

**Resultado esperado:**
```
email: admin@davistore.com
role: admin
contraseña: Admin123!
```

### 2. Categorías

```sql
SELECT name, slug FROM categories WHERE parent_id IS NULL;
```

**Resultado esperado:**
```
Electrónica | electronica
Ropa | ropa
Hogar | hogar
Deportes | deportes
Libros | libros
```

### 3. Productos

```sql
SELECT sku, name, price FROM products;
```

**Resultado esperado:**
```
ELEC-001 | Smartphone Galaxy X10 | 799.99
ELEC-002 | Laptop ProBook 15 | 1299.99
```

---

## 🔍 Comandos Útiles

### PostgreSQL

```bash
# Conectarse a la base de datos
psql -U postgres -d davistore_db

# Ver todas las tablas
\dt

# Describir una tabla
\d users

# Ver datos de una tabla
SELECT * FROM users;

# Salir
\q
```

### Node.js / npm

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilar a JavaScript
npm run build

# Ejecutar en producción
npm start

# Linter (detectar problemas)
npm run lint

# Formatear código
npm run format

# Tests (cuando estén implementados)
npm test
```

---

## 📁 Estructura de Archivos del Proyecto

```
Backend/
│
├── src/                          # Código fuente
│   ├── config/                   # Configuraciones
│   ├── controllers/              # Controladores HTTP
│   ├── services/                 # Lógica de negocio
│   ├── repositories/             # Acceso a datos
│   ├── models/                   # Interfaces TypeScript
│   ├── middlewares/              # Middlewares (auth, validation)
│   ├── routes/                   # Rutas de la API
│   ├── validators/               # Validaciones
│   ├── utils/                    # Utilidades
│   ├── database/                 # Scripts SQL
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   └── index.ts                  # Punto de entrada
│
├── dist/                         # Compilado (generado)
├── node_modules/                 # Dependencias (generado)
│
├── .env                          # Variables de entorno (crear)
├── .env.example                  # Ejemplo de variables
├── .gitignore                    # Archivos ignorados por git
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
│
├── README.md                     # Documentación principal
├── DATABASE_DESIGN.md            # Diseño de BD detallado
├── DATABASE_ER_DIAGRAM.md        # Diagrama ER visual
├── BEST_PRACTICES.md             # Explicación de buenas prácticas
└── QUICK_START.md                # Esta guía
```

---

## 🐛 Solución de Problemas Comunes

### Error: "role 'postgres' does not exist"

**Solución:** Crea el usuario postgres o usa tu usuario de PostgreSQL:

```bash
# Crea el usuario
createuser -s postgres

# O edita .env con tu usuario real
DB_USER=tu_usuario_aqui
```

### Error: "database 'davistore_db' does not exist"

**Solución:** Crea la base de datos manualmente:

```bash
psql -U postgres -c "CREATE DATABASE davistore_db;"
```

### Error: "password authentication failed"

**Solución:** Verifica la contraseña en `.env`:

```env
DB_PASSWORD=tu_contraseña_correcta
```

### Error: "Cannot find module..."

**Solución:** Reinstala las dependencias:

```bash
# Borra node_modules y reinstala
rmdir /s /q node_modules
npm install
```

### Error: "Port 3000 is already in use"

**Solución:** Cambia el puerto en `.env`:

```env
PORT=3001
```

O detén la aplicación que usa el puerto 3000.

---

## 📚 Próximos Pasos

Una vez que el servidor esté funcionando, puedes:

1. **Explorar la base de datos** en pgAdmin
2. **Leer la documentación completa** en README.md
3. **Revisar el diseño de BD** en DATABASE_DESIGN.md
4. **Entender las mejores prácticas** en BEST_PRACTICES.md
5. **Comenzar a desarrollar** endpoints de la API

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. **Revisa los logs** de la aplicación y PostgreSQL
2. **Verifica las variables de entorno** en `.env`
3. **Confirma que PostgreSQL está ejecutándose**
4. **Revisa la sección de troubleshooting** arriba

---

## 📊 Diagrama del Flujo de Instalación

```
┌─────────────────────┐
│  Instalar Node.js   │
│  & PostgreSQL       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Clonar Proyecto    │
│  npm install        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Crear DB en        │
│  PostgreSQL         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Configurar .env    │
│  (DB credentials)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Ejecutar           │
│  Migraciones SQL    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Verificar          │
│  Instalación        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  npm run dev        │
│  ¡Listo! 🎉         │
└─────────────────────┘
```

---

## ✅ Checklist de Instalación

- [ ] Node.js >= 18.x instalado
- [ ] PostgreSQL >= 14.x instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos `davistore_db` creada
- [ ] Archivo `.env` configurado
- [ ] Migraciones ejecutadas exitosamente
- [ ] Tablas creadas verificadas
- [ ] Datos iniciales cargados
- [ ] Servidor puede iniciar sin errores

---

¡Felicidades! Tu entorno de desarrollo está listo para comenzar a trabajar. 🎉

