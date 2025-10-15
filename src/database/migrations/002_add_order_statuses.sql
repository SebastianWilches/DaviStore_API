-- =====================================================
-- Migración: Agregar estados 'shipped' y 'delivered' a order_status
-- Fecha: 2025-10-15
-- =====================================================

-- Agregar estado 'shipped' (enviado)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped' AFTER 'processing';

-- Agregar estado 'delivered' (entregado)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered' AFTER 'shipped';

-- Verificar los valores del tipo
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'order_status'::regtype 
ORDER BY enumsortorder;

-- Mensaje de confirmación
SELECT 'Estados de orden actualizados exitosamente' AS message;

