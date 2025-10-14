# =====================================================
# Script PowerShell: Reset y Migracion de Base de Datos
# Solo para DESARROLLO LOCAL
# =====================================================

param(
    [string]$DbUser = "postgres",
    [string]$DbName = "davistore_db",
    [switch]$SkipConfirmation
)

# =====================================================
# Funcion para encontrar psql
# =====================================================
function Find-PSQL {
    # Intentar encontrar psql en el PATH
    $psqlInPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        return $psqlInPath.Source
    }

    # Ubicaciones comunes de PostgreSQL en Windows
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\*\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe",
        "C:\PostgreSQL\*\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\*\bin\psql.exe",
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin\psql.exe"
    )

    foreach ($path in $commonPaths) {
        $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | 
                 Sort-Object FullName -Descending | 
                 Select-Object -First 1
        
        if ($found) {
            return $found.FullName
        }
    }

    return $null
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DaviStore - Reset y Migracion de Base de Datos" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Buscar psql
Write-Host "[>] Buscando PostgreSQL..." -ForegroundColor Cyan
$psqlPath = Find-PSQL

if (-not $psqlPath) {
    Write-Host "[X] Error: No se encontro PostgreSQL instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "1. Instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. O ejecuta: npm run db:find-psql" -ForegroundColor White
    Write-Host "   para obtener instrucciones de configuracion" -ForegroundColor White
    exit 1
}

Write-Host "[OK] PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en desarrollo
if (-not $env:NODE_ENV) {
    $env:NODE_ENV = "development"
}

if ($env:NODE_ENV -ne "development" -and !$SkipConfirmation) {
    Write-Host "[!] ADVERTENCIA: NODE_ENV no es 'development'" -ForegroundColor Yellow
    Write-Host "Ambiente actual: $env:NODE_ENV" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseas continuar? (escribir 'SI' en mayusculas)"
    
    if ($continue -ne "SI") {
        Write-Host "[X] Operacion cancelada" -ForegroundColor Red
        exit 1
    }
}

# Confirmar accion
if (!$SkipConfirmation) {
    Write-Host "[!] Esta operacion ELIMINARA todos los datos de la base de datos" -ForegroundColor Yellow
    Write-Host "Base de datos: $DbName" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Estas seguro? (escribir 'SI' en mayusculas)"
    
    if ($confirm -ne "SI") {
        Write-Host "[X] Operacion cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[>] Iniciando proceso..." -ForegroundColor Green
Write-Host ""

# Rutas de migraciones
$resetScript = "src\database\migrations\000_reset_database.sql"
$initialSchema = "src\database\migrations\001_initial_schema.sql"

# Verificar que los archivos existen
if (!(Test-Path $resetScript)) {
    Write-Host "[X] Error: No se encuentra $resetScript" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $initialSchema)) {
    Write-Host "[X] Error: No se encuentra $initialSchema" -ForegroundColor Red
    exit 1
}

# Paso 1: Reset
Write-Host "[1/2] Limpiando base de datos..." -ForegroundColor Cyan
$resetResult = Get-Content $resetScript | & $psqlPath -U $DbUser -d $DbName 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error ejecutando reset:" -ForegroundColor Red
    Write-Host $resetResult -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Base de datos limpiada" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear schema
Write-Host "[2/2] Creando schema inicial..." -ForegroundColor Cyan
$schemaResult = Get-Content $initialSchema | & $psqlPath -U $DbUser -d $DbName 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error ejecutando schema inicial:" -ForegroundColor Red
    Write-Host $schemaResult -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Schema inicial creado" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Proceso completado exitosamente" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Base de datos lista para usar" -ForegroundColor Green
Write-Host "     Tablas creadas: 8" -ForegroundColor Green
Write-Host "     Relaciones: 9" -ForegroundColor Green
Write-Host "     Usuario admin: admin@davistore.com" -ForegroundColor Green
Write-Host "     Categorias de ejemplo: 5" -ForegroundColor Green
Write-Host "     Productos de ejemplo: 2" -ForegroundColor Green
Write-Host ""
Write-Host "[>>] Puedes iniciar el servidor con: npm run dev" -ForegroundColor Cyan
Write-Host ""

