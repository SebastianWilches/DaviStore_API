-- =====================================================
-- SCRIPT DE RESET - SOLO PARA DESARROLLO LOCAL
-- ⚠️ NUNCA EJECUTAR EN PRODUCCIÓN ⚠️
-- =====================================================
-- Este script ELIMINA TODO y vuelve a crear la BD desde cero
-- Útil para desarrollo local cuando quieres empezar limpio
-- =====================================================

-- =====================================================
-- ADVERTENCIA
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '⚠️⚠️⚠️ ADVERTENCIA ⚠️⚠️⚠️';
    RAISE NOTICE 'Este script ELIMINARÁ TODAS las tablas y datos';
    RAISE NOTICE 'Solo debe ejecutarse en ambiente de DESARROLLO';
    RAISE NOTICE 'Esperando 3 segundos...';
    PERFORM pg_sleep(3);
END $$;

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (orden correcto por FK)
-- =====================================================

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =====================================================
-- ELIMINAR VISTAS
-- =====================================================

DROP VIEW IF EXISTS v_products_with_category CASCADE;
DROP VIEW IF EXISTS v_orders_with_user CASCADE;

-- =====================================================
-- ELIMINAR FUNCIONES
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;

-- =====================================================
-- ELIMINAR TIPOS ENUM
-- =====================================================

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS cart_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- =====================================================
-- ELIMINAR EXTENSIONES (opcional, generalmente se mantienen)
-- =====================================================

-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos limpiada exitosamente';
    RAISE NOTICE '📝 Ahora ejecuta: 001_initial_schema.sql';
END $$;

