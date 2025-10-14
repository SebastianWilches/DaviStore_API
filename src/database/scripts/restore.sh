#!/bin/bash
# =====================================================
# Script Bash: Restaurar Base de Datos desde Backup
# Para produccion
# =====================================================

set -e

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
BACKUP_FILE="${1:-}"

echo ""
echo "============================================================"
echo "  DaviStore - Restaurar Base de Datos"
echo "============================================================"
echo ""

# Verificar que se proporciono un archivo
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}[X] Error: Debes especificar un archivo de backup${NC}"
    echo ""
    echo "Uso: ./restore.sh <archivo_backup.sql.gz>"
    echo ""
    echo "Backups disponibles:"
    ls -lh ./backups/*.gz 2>/dev/null || echo "No hay backups disponibles"
    exit 1
fi

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}[X] Error: No se encuentra el archivo $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}[!] ADVERTENCIA: Esta operacion SOBRESCRIBIRA la base de datos actual${NC}"
echo "Base de datos: $DB_NAME"
echo "Backup: $BACKUP_FILE"
echo ""
read -p "Estas seguro? (escribir 'SI' en mayusculas): " confirm

if [ "$confirm" != "SI" ]; then
    echo -e "${RED}[X] Operacion cancelada${NC}"
    exit 1
fi

# Descomprimir si es necesario
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${CYAN}[>] Descomprimiendo backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

echo -e "${CYAN}[>] Restaurando base de datos...${NC}"

# Restaurar
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$RESTORE_FILE"; then
    echo -e "${GREEN}[OK] Base de datos restaurada exitosamente${NC}"
else
    echo -e "${RED}[X] Error restaurando base de datos${NC}"
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 1
fi

# Limpiar archivo temporal
[ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"

echo ""
echo -e "${GREEN}[OK] Proceso completado${NC}"
echo ""

