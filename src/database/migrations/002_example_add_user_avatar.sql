-- =====================================================
-- MIGRACIÓN 002: Agregar campo avatar a usuarios
-- Fecha: 2024-10-14
-- Descripción: Ejemplo de migración incremental
-- =====================================================

-- =====================================================
-- UP: Aplicar cambios
-- =====================================================

-- Agregar columna avatar_url
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Agregar comentario
COMMENT ON COLUMN users.avatar_url IS 'URL de la imagen de avatar del usuario';

-- Crear índice si es necesario (opcional)
-- CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url);

-- =====================================================
-- Verificación
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        RAISE NOTICE '✅ Migración 002 aplicada exitosamente: avatar_url agregado a users';
    ELSE
        RAISE EXCEPTION '❌ Error: La columna avatar_url no fue creada';
    END IF;
END $$;

-- =====================================================
-- DOWN: Revertir cambios (para rollback)
-- =====================================================

-- Para revertir esta migración, ejecutar:
-- ALTER TABLE users DROP COLUMN IF EXISTS avatar_url CASCADE;

-- =====================================================
-- NOTAS:
-- - Este es un ejemplo de migración incremental
-- - Cada cambio debe estar en un archivo separado
-- - Usar nomenclatura: 00X_descripcion.sql
-- - Incluir siempre UP (aplicar) y DOWN (revertir)
-- - Documentar fecha y propósito
-- =====================================================

