#!/bin/bash
# =====================================================
# Script Bash: Aplicar Migraciones Incrementales
# Para desarrollo y produccion (Linux/Mac)
# =====================================================

set -e  # Detener en cualquier error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parametros
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-davistore_db}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MIGRATION_FILE="${1:-}"

echo ""
echo "============================================================"
echo "  DaviStore - Aplicar Migraciones"
echo "============================================================"
echo ""

# Verificar conexion
echo -e "${CYAN}[>] Verificando conexion a PostgreSQL...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}[X] Error: No se puede conectar a PostgreSQL${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Conexion establecida${NC}"
echo ""

MIGRATIONS_PATH="src/database/migrations"

# Si se especifico un archivo especifico
if [ -n "$MIGRATION_FILE" ]; then
    FULL_PATH="$MIGRATIONS_PATH/$MIGRATION_FILE"
    
    if [ ! -f "$FULL_PATH" ]; then
        echo -e "${RED}[X] Error: No se encuentra $FULL_PATH${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}[>] Aplicando migracion: $MIGRATION_FILE${NC}"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$FULL_PATH"; then
        echo -e "${GREEN}[OK] Migracion aplicada exitosamente${NC}"
    else
        echo -e "${RED}[X] Error aplicando migracion${NC}"
        exit 1
    fi
else
    # Aplicar todas las migraciones incrementales (002+)
    MIGRATIONS=$(find "$MIGRATIONS_PATH" -name "00[2-9]_*.sql" -o -name "0[1-9][0-9]_*.sql" | sort)
    
    if [ -z "$MIGRATIONS" ]; then
        echo -e "${YELLOW}[i] No hay migraciones pendientes${NC}"
        exit 0
    fi
    
    COUNT=$(echo "$MIGRATIONS" | wc -l)
    echo -e "${CYAN}[i] Migraciones encontradas: $COUNT${NC}"
    echo ""
    
    for migration in $MIGRATIONS; do
        FILENAME=$(basename "$migration")
        echo -e "${CYAN}[>] Aplicando: $FILENAME${NC}"
        
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration" > /dev/null 2>&1; then
            echo -e "${GREEN}[OK] $FILENAME - OK${NC}"
        else
            echo -e "${RED}[X] Error en $FILENAME${NC}"
            echo -e "${YELLOW}[!] Las migraciones siguientes no se ejecutaron${NC}"
            exit 1
        fi
        echo ""
    done
    
    echo -e "${GREEN}[OK] Todas las migraciones aplicadas exitosamente${NC}"
fi

echo ""

