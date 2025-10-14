# Configuración de Variables de Entorno

Este archivo documenta todas las variables de entorno necesarias para ejecutar la aplicación.

## Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# ================================
# CONFIGURACIÓN DEL SERVIDOR
# ================================
NODE_ENV=development
PORT=3000
API_VERSION=v1

# ================================
# CONFIGURACIÓN DE BASE DE DATOS
# ================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=davistore_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_MAX_CONNECTIONS=20

# ================================
# CONFIGURACIÓN DE JWT
# ================================
# IMPORTANTE: Cambia estos valores en producción
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRES_IN=7d

# ================================
# CONFIGURACIÓN DE SEGURIDAD
# ================================
BCRYPT_ROUNDS=10

# ================================
# CONFIGURACIÓN DE CORS
# ================================
# Separar múltiples orígenes con comas
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ================================
# CONFIGURACIÓN DE RATE LIMITING
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Descripción de Variables

### Servidor

- **NODE_ENV**: Entorno de ejecución (`development`, `production`, `test`)
- **PORT**: Puerto en el que correrá el servidor (por defecto: 3000)
- **API_VERSION**: Versión de la API (por defecto: v1)

### Base de Datos

- **DB_HOST**: Host de PostgreSQL (por defecto: localhost)
- **DB_PORT**: Puerto de PostgreSQL (por defecto: 5432)
- **DB_NAME**: Nombre de la base de datos
- **DB_USER**: Usuario de PostgreSQL
- **DB_PASSWORD**: Contraseña de PostgreSQL
- **DB_MAX_CONNECTIONS**: Máximo de conexiones en el pool

### JWT (JSON Web Tokens)

- **JWT_SECRET**: Secret key para firmar access tokens (¡CAMBIAR EN PRODUCCIÓN!)
- **JWT_EXPIRES_IN**: Tiempo de expiración del access token (ej: 15m, 1h, 7d)
- **JWT_REFRESH_SECRET**: Secret key para firmar refresh tokens (¡CAMBIAR EN PRODUCCIÓN!)
- **JWT_REFRESH_EXPIRES_IN**: Tiempo de expiración del refresh token

### Seguridad

- **BCRYPT_ROUNDS**: Número de salt rounds para bcrypt (entre 10 y 15)

### CORS

- **ALLOWED_ORIGINS**: Orígenes permitidos para CORS (separados por comas)

### Rate Limiting

- **RATE_LIMIT_WINDOW_MS**: Ventana de tiempo en milisegundos (15 minutos = 900000ms)
- **RATE_LIMIT_MAX_REQUESTS**: Máximo de requests por ventana de tiempo

## Notas de Seguridad

⚠️ **IMPORTANTE PARA PRODUCCIÓN:**

1. **JWT Secrets**: Genera secrets aleatorios y seguros:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Contraseña de BD**: Usa una contraseña fuerte y única

3. **CORS**: Especifica solo los orígenes necesarios

4. **HTTPS**: En producción, usa HTTPS obligatoriamente

5. **Variables de Entorno**: Nunca commitear el archivo `.env` al repositorio

