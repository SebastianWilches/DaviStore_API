# =====================================================
# Script PowerShell: Aplicar Migraciones Incrementales
# Para desarrollo y produccion
# =====================================================

param(
    [string]$DbUser = "postgres",
    [string]$DbName = "davistore_db",
    [string]$MigrationFile = ""
)

# =====================================================
# Funcion para encontrar psql
# =====================================================
function Find-PSQL {
    $psqlInPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        return $psqlInPath.Source
    }

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
Write-Host "  DaviStore - Aplicar Migraciones" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Buscar psql
$psqlPath = Find-PSQL
if (-not $psqlPath) {
    Write-Host "[X] Error: No se encontro PostgreSQL" -ForegroundColor Red
    Write-Host "Ejecuta: npm run db:find-psql" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

$migrationsPath = "src\database\migrations"

# Si se especifico un archivo especifico
if ($MigrationFile -ne "") {
    $fullPath = Join-Path $migrationsPath $MigrationFile
    
    if (!(Test-Path $fullPath)) {
        Write-Host "[X] Error: No se encuentra $fullPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[>] Aplicando migracion: $MigrationFile" -ForegroundColor Cyan
    $result = Get-Content $fullPath | & $psqlPath -U $DbUser -d $DbName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Migracion aplicada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "[X] Error aplicando migracion:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
}
else {
    # Aplicar todas las migraciones incrementales (002+)
    $migrations = Get-ChildItem -Path $migrationsPath -Filter "0*_*.sql" | 
                  Where-Object { $_.Name -match "^00[2-9]|^0[1-9][0-9]" } |
                  Sort-Object Name
    
    if ($migrations.Count -eq 0) {
        Write-Host "[i] No hay migraciones pendientes" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "[i] Migraciones encontradas: $($migrations.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($migration in $migrations) {
        Write-Host "[>] Aplicando: $($migration.Name)" -ForegroundColor Cyan
        
        $result = Get-Content $migration.FullName | & $psqlPath -U $DbUser -d $DbName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] $($migration.Name) - OK" -ForegroundColor Green
        } else {
            Write-Host "[X] Error en $($migration.Name):" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            Write-Host ""
            Write-Host "[!] Las migraciones siguientes no se ejecutaron" -ForegroundColor Yellow
            exit 1
        }
        Write-Host ""
    }
    
    Write-Host "[OK] Todas las migraciones aplicadas exitosamente" -ForegroundColor Green
}

Write-Host ""

