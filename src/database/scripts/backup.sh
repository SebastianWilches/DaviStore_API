#!/bin/bash
# =====================================================
# Script Bash: Backup de Base de Datos
# Para produccion
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parametros
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-davistore_db}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Nombre del archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"

echo ""
echo "============================================================"
echo "  DaviStore - Backup de Base de Datos"
echo "============================================================"
echo ""

echo -e "${CYAN}[>] Creando backup...${NC}"
echo "Base de datos: $DB_NAME"
echo "Archivo: $BACKUP_FILE"
echo ""

# Crear backup
if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F p -f "$BACKUP_FILE"; then
    echo -e "${GREEN}[OK] Backup creado exitosamente${NC}"
    
    # Mostrar tamano del archivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Tamano: $SIZE"
    
    # Comprimir
    echo -e "${CYAN}[>] Comprimiendo...${NC}"
    gzip "$BACKUP_FILE"
    COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}[OK] Backup comprimido: ${BACKUP_FILE}.gz${NC}"
    echo "Tamano comprimido: $COMPRESSED_SIZE"
else
    echo -e "${RED}[X] Error creando backup${NC}"
    exit 1
fi

# Listar backups existentes
echo ""
echo "Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null || echo "No hay backups anteriores"

echo ""
echo -e "${GREEN}[OK] Proceso completado${NC}"
echo ""

