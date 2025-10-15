# 🚀 Guía de Deployment a Producción

## 🎯 Resumen Ejecutivo

Los **scripts PowerShell (.ps1)** son **SOLO para desarrollo local en Windows**.

Para **producción** (Linux/Docker/Cloud) necesitas:
1. Scripts Bash (.sh) ✅ **YA CREADOS**
2. Variables de entorno de producción
3. Estrategia de backup y rollback
4. Proceso de deployment controlado

---

## 📁 Scripts Disponibles

### 🪟 Windows (Desarrollo Local)

```
src/database/scripts/
├── reset-and-migrate.ps1  ✅ Windows PowerShell
├── migrate.ps1            ✅ Windows PowerShell
└── find-psql.ps1          ✅ Windows PowerShell
```

**Uso:**
```powershell
npm run db:reset           # Reset completo
npm run db:migrate         # Migraciones incrementales
npm run db:find-psql       # Encontrar PostgreSQL
```

---

### 🐧 Linux/Mac (Producción)

```
src/database/scripts/
├── reset-and-migrate.sh   ✅ Bash (Linux/Mac)
├── migrate.sh             ✅ Bash (Linux/Mac)
├── backup.sh              ✅ Bash (crear backups)
└── restore.sh             ✅ Bash (restaurar backups)
```

**Uso:**
```bash
# Dar permisos de ejecucion (primera vez)
chmod +x src/database/scripts/*.sh

# Ejecutar
./src/database/scripts/migrate.sh
./src/database/scripts/backup.sh
./src/database/scripts/restore.sh backup.sql.gz
```

---

## 🌍 Estrategia de Deployment por Ambiente

### 1️⃣ Desarrollo Local (Tu máquina - Windows)

```powershell
# Usar scripts PowerShell
npm run db:reset            # Reset completo OK
npm run db:migrate          # Migraciones OK
```

**Características:**
- ✅ Reset completo permitido
- ✅ Sin backups necesarios
- ✅ Experimentación libre
- ✅ Scripts PowerShell

---

### 2️⃣ Staging/Testing (Servidor - Linux)

```bash
# Variables de entorno
export DB_HOST="staging-db.example.com"
export DB_USER="davistore_staging"
export DB_PASSWORD="staging_password"
export DB_NAME="davistore_staging"
export NODE_ENV="staging"

# Crear backup antes de migrar
./src/database/scripts/backup.sh

# Aplicar migraciones
./src/database/scripts/migrate.sh

# Si algo sale mal, restaurar
./src/database/scripts/restore.sh backups/davistore_staging_backup_20241014_120000.sql.gz
```

**Características:**
- ❌ NO usar reset
- ✅ Solo migraciones incrementales
- ✅ Backups antes de cada cambio
- ✅ Scripts Bash
- ✅ Variables de entorno

---

### 3️⃣ Producción (Servidor - Linux)

```bash
# 1. Variables de entorno (desde secrets manager)
export DB_HOST="prod-db.example.com"
export DB_USER="davistore_prod"
export DB_PASSWORD="$PROD_DB_PASSWORD"  # Desde vault/secrets
export DB_NAME="davistore_production"
export NODE_ENV="production"

# 2. SIEMPRE crear backup primero
./src/database/scripts/backup.sh

# 3. Aplicar migración específica (una a la vez)
./src/database/scripts/migrate.sh 003_add_new_feature.sql

# 4. Verificar que funciona
npm start  # o tu comando de producción

# 5. Si falla, ROLLBACK inmediato
./src/database/scripts/restore.sh backups/davistore_production_backup_20241014_120000.sql.gz
```

**Características:**
- ❌❌❌ NUNCA usar reset
- ✅ Solo migraciones incrementales
- ✅ SIEMPRE backup antes de migrar
- ✅ Aplicar una migración a la vez
- ✅ Plan de rollback preparado
- ✅ Scripts Bash
- ✅ Variables desde secrets manager
- ✅ Monitoreo y alertas

---

## 🔐 Variables de Entorno por Ambiente

### Desarrollo Local (.env)

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=davistore_db
DB_USER=postgres
DB_PASSWORD=tu_password_local
```

### Staging (.env.staging)

```env
NODE_ENV=staging
DB_HOST=staging-db.internal
DB_PORT=5432
DB_NAME=davistore_staging
DB_USER=davistore_app
DB_PASSWORD=${STAGING_DB_PASSWORD}  # Desde secrets
```

### Producción (.env.production)

```env
NODE_ENV=production
DB_HOST=prod-db.internal
DB_PORT=5432
DB_NAME=davistore_production
DB_USER=davistore_app
DB_PASSWORD=${PROD_DB_PASSWORD}  # Desde secrets
# Usar AWS Secrets Manager, Azure Key Vault, etc.
```

---

## 📋 Checklist de Deployment a Producción

### Antes de Desplegar

- [ ] Crear backup completo de producción
- [ ] Probar migración en staging
- [ ] Verificar que staging funciona correctamente
- [ ] Revisar el código de la migración
- [ ] Preparar plan de rollback
- [ ] Notificar al equipo
- [ ] Ventana de mantenimiento (si es necesario)

### Durante el Deployment

- [ ] Crear backup pre-deployment
- [ ] Aplicar migración
- [ ] Verificar logs
- [ ] Probar funcionalidad crítica
- [ ] Verificar que no hay errores

### Después del Deployment

- [ ] Monitorear errores
- [ ] Verificar performance
- [ ] Confirmar que todo funciona
- [ ] Documentar el deployment
- [ ] Mantener backup por X días

### Si Algo Sale Mal

- [ ] Detener aplicación
- [ ] Restaurar backup
- [ ] Verificar restauración
- [ ] Iniciar aplicación
- [ ] Investigar causa
- [ ] Documentar incidente

---

## 🐳 Deployment con Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar PostgreSQL client
RUN apk add --no-cache postgresql-client bash

# Copiar archivos
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Dar permisos a scripts
RUN chmod +x src/database/scripts/*.sh

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml (Producción)

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  api:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      - db

volumes:
  postgres_data:
```

### Ejecutar Migraciones en Docker

```bash
# Opción 1: Ejecutar script dentro del contenedor
docker-compose exec api ./src/database/scripts/migrate.sh

# Opción 2: Ejecutar directamente con psql
docker-compose exec db psql -U davistore_app -d davistore_production -f /migrations/003_new_feature.sql

# Opción 3: Crear backup
docker-compose exec api ./src/database/scripts/backup.sh
```

---

## ☁️ Deployment en Cloud

### AWS (RDS + ECS/EC2)

```bash
# 1. Conectarse al servidor
ssh user@ec2-instance.amazonaws.com

# 2. Variables desde AWS Secrets Manager
export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id prod/db/password --query SecretString --output text)

# 3. Aplicar migraciones
cd /app
./src/database/scripts/backup.sh
./src/database/scripts/migrate.sh
```

### Heroku

```bash
# Heroku ejecuta migraciones automáticamente si configuras release phase
# Procfile:
release: bash src/database/scripts/migrate.sh
web: npm start
```

### Digital Ocean / Azure / GCP

Similar a AWS, usar scripts bash y secrets manager del proveedor.

---

## 🔄 CI/CD Pipeline (GitHub Actions / GitLab CI)

### .github/workflows/deploy-production.yml

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Create backup
        env:
          DB_HOST: ${{ secrets.PROD_DB_HOST }}
          DB_USER: ${{ secrets.PROD_DB_USER }}
          DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}
          DB_NAME: ${{ secrets.PROD_DB_NAME }}
        run: |
          chmod +x src/database/scripts/*.sh
          ./src/database/scripts/backup.sh
      
      - name: Run migrations
        env:
          DB_HOST: ${{ secrets.PROD_DB_HOST }}
          DB_USER: ${{ secrets.PROD_DB_USER }}
          DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}
          DB_NAME: ${{ secrets.PROD_DB_NAME }}
        run: ./src/database/scripts/migrate.sh
      
      - name: Deploy application
        run: |
          # Tu comando de deployment aquí
          # ssh, docker, kubernetes, etc.
```

---

## 📊 Mejores Prácticas en Producción

### ✅ DO (Hacer)

1. **SIEMPRE crear backup antes de migrar**
```bash
./backup.sh && ./migrate.sh
```

2. **Aplicar migraciones una a la vez**
```bash
./migrate.sh 003_add_feature.sql  # Una a la vez
```

3. **Probar en staging primero**
```bash
# Staging → Si funciona → Producción
```

4. **Usar variables de entorno**
```bash
# NO hardcodear passwords
export DB_PASSWORD="$SECRET"
```

5. **Mantener logs de migraciones**
```bash
./migrate.sh 2>&1 | tee migration_$(date +%Y%m%d_%H%M%S).log
```

6. **Ventana de mantenimiento para cambios grandes**
```bash
# Notificar usuarios
# Modo mantenimiento
# Migrar
# Verificar
# Reactivar
```

### ❌ DON'T (No hacer)

1. **NUNCA ejecutar reset en producción**
```bash
# ❌ NUNCA HACER ESTO EN PRODUCCIÓN
./reset-and-migrate.sh
```

2. **NO migrar sin backup**
```bash
# ❌ MAL
./migrate.sh

# ✅ BIEN
./backup.sh && ./migrate.sh
```

3. **NO hardcodear passwords**
```bash
# ❌ MAL
DB_PASSWORD="mi_password"

# ✅ BIEN
DB_PASSWORD="${PROD_DB_PASSWORD}"  # Desde secrets
```

4. **NO aplicar todas las migraciones de golpe en producción**
```bash
# ❌ MAL en producción
./migrate.sh  # Aplica todas

# ✅ BIEN
./migrate.sh 003_feature.sql  # Una a la vez
```

---

## 🎓 Resumen

```
┌─────────────────────────────────────────────────────────────┐
│  AMBIENTE         │  SCRIPTS      │  RESET  │  BACKUP       │
├───────────────────┼───────────────┼─────────┼───────────────┤
│  Desarrollo (Win) │  PowerShell   │  ✅ SI  │  ❌ No        │
│  Desarrollo (Mac) │  Bash         │  ✅ SI  │  ❌ No        │
│  Staging (Linux)  │  Bash         │  ❌ NO  │  ✅ Siempre   │
│  Producción       │  Bash         │  ❌ NO  │  ✅ Siempre   │
│  Docker           │  Bash         │  ❌ NO  │  ✅ Siempre   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Para Empezar en Producción

### 1. Dar permisos a scripts (primera vez)

```bash
chmod +x src/database/scripts/*.sh
```

### 2. Configurar variables de entorno

```bash
export DB_HOST="tu-servidor.com"
export DB_USER="davistore_app"
export DB_PASSWORD="tu_password_seguro"
export DB_NAME="davistore_production"
```

### 3. Crear primer backup

```bash
./src/database/scripts/backup.sh
```

### 4. Aplicar migraciones

```bash
./src/database/scripts/migrate.sh 002_tu_migracion.sql
```

---

**¡Estás listo para deployment profesional!** 🎉

Los archivos SQL de migración funcionan igual en Windows y Linux. Solo cambian los scripts de ejecución.

