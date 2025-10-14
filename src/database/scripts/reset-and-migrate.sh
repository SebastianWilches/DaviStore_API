#!/bin/bash
# =====================================================
# Script Bash: Reset y Migracion de Base de Datos
# Solo para DESARROLLO LOCAL (Linux/Mac)
# =====================================================

set -e  # Detener en cualquier error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parametros con valores por defecto
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-davistore_db}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo ""
echo "============================================================"
echo "  DaviStore - Reset y Migracion de Base de Datos"
echo "============================================================"
echo ""

# Verificar que estamos en desarrollo
NODE_ENV="${NODE_ENV:-development}"

if [ "$NODE_ENV" != "development" ]; then
    echo -e "${YELLOW}[!] ADVERTENCIA: NODE_ENV no es 'development'${NC}"
    echo "Ambiente actual: $NODE_ENV"
    echo ""
    read -p "Deseas continuar? (escribir 'SI' en mayusculas): " confirm
    
    if [ "$confirm" != "SI" ]; then
        echo -e "${RED}[X] Operacion cancelada${NC}"
        exit 1
    fi
fi

# Confirmar accion
echo -e "${YELLOW}[!] Esta operacion ELIMINARA todos los datos de la base de datos${NC}"
echo "Base de datos: $DB_NAME"
echo ""
read -p "Estas seguro? (escribir 'SI' en mayusculas): " confirm

if [ "$confirm" != "SI" ]; then
    echo -e "${RED}[X] Operacion cancelada${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[>] Iniciando proceso...${NC}"
echo ""

# Rutas de migraciones
RESET_SCRIPT="src/database/migrations/000_reset_database.sql"
INITIAL_SCHEMA="src/database/migrations/001_initial_schema.sql"

# Verificar que los archivos existen
if [ ! -f "$RESET_SCRIPT" ]; then
    echo -e "${RED}[X] Error: No se encuentra $RESET_SCRIPT${NC}"
    exit 1
fi

if [ ! -f "$INITIAL_SCHEMA" ]; then
    echo -e "${RED}[X] Error: No se encuentra $INITIAL_SCHEMA${NC}"
    exit 1
fi

# Verificar conexion a PostgreSQL
echo -e "${CYAN}[>] Verificando conexion a PostgreSQL...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}[X] Error: No se puede conectar a PostgreSQL${NC}"
    echo "Host: $DB_HOST:$DB_PORT"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    exit 1
fi
echo -e "${GREEN}[OK] Conexion establecida${NC}"
echo ""

# Paso 1: Reset
echo -e "${CYAN}[1/2] Limpiando base de datos...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$RESET_SCRIPT" > /dev/null 2>&1; then
    echo -e "${RED}[X] Error ejecutando reset${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Base de datos limpiada${NC}"
echo ""

# Paso 2: Crear schema
echo -e "${CYAN}[2/2] Creando schema inicial...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$INITIAL_SCHEMA" > /dev/null 2>&1; then
    echo -e "${RED}[X] Error ejecutando schema inicial${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Schema inicial creado${NC}"
echo ""

# Resumen
echo "============================================================"
echo "  Proceso completado exitosamente"
echo "============================================================"
echo ""
echo -e "${GREEN}[OK] Base de datos lista para usar${NC}"
echo "     Tablas creadas: 8"
echo "     Relaciones: 9"
echo "     Usuario admin: admin@davistore.com"
echo "     Categorias de ejemplo: 5"
echo "     Productos de ejemplo: 2"
echo ""
echo -e "${CYAN}[>>] Puedes iniciar el servidor con: npm run dev${NC}"
echo ""

