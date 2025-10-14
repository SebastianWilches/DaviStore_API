# =====================================================
# Script para encontrar la instalacion de PostgreSQL
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
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin\psql.exe",
        "$env:LOCALAPPDATA\Programs\PostgreSQL\*\bin\psql.exe"
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

# Buscar psql
$psqlPath = Find-PSQL

if ($psqlPath) {
    Write-Host "[OK] PostgreSQL encontrado en:" -ForegroundColor Green
    Write-Host "     $psqlPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para agregar al PATH permanentemente:" -ForegroundColor Yellow
    Write-Host "1. Copia la ruta del directorio bin:" -ForegroundColor White
    Write-Host "   $(Split-Path $psqlPath)" -ForegroundColor Cyan
    Write-Host "2. Panel de Control > Sistema > Configuracion avanzada" -ForegroundColor White
    Write-Host "3. Variables de entorno > Path > Editar > Nuevo" -ForegroundColor White
    Write-Host "4. Pega la ruta y guarda" -ForegroundColor White
} else {
    Write-Host "[X] No se encontro PostgreSQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalacion:" -ForegroundColor Yellow
    Write-Host "1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Instala con configuracion por defecto" -ForegroundColor White
    Write-Host "3. Ejecuta este script nuevamente" -ForegroundColor White
}

Write-Host ""

