-- =====================================================
-- DaviStore E-commerce Database Schema
-- PostgreSQL 14+
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Estados del carrito
CREATE TYPE cart_status AS ENUM ('active', 'completed', 'abandoned');

-- Estados de orden
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Métodos de pago
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'paypal', 'transfer');

-- Estados de pago
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');

-- =====================================================
-- TABLA: roles
-- Roles del sistema con información adicional
-- =====================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT role_name_format_check CHECK (name ~* '^[a-z_]+$')
);

-- Índices
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_active ON roles(is_active);

-- Comentarios
COMMENT ON TABLE roles IS 'Roles del sistema (escalable sin necesidad de ALTER TYPE)';
COMMENT ON COLUMN roles.name IS 'Identificador interno del rol (snake_case, inmutable)';
COMMENT ON COLUMN roles.display_name IS 'Nombre visible para usuarios';
COMMENT ON COLUMN roles.description IS 'Descripción del rol y sus responsabilidades';

-- =====================================================
-- TABLA: users
-- Almacena información de usuarios del sistema
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Almacena información de usuarios del sistema (clientes y administradores)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña (nunca se almacena en texto plano)';
COMMENT ON COLUMN users.role_id IS 'Rol del usuario (FK a tabla roles para escalabilidad)';
COMMENT ON COLUMN users.is_active IS 'Soft delete: false para desactivar usuario sin eliminar datos';

-- =====================================================
-- TABLA: categories
-- Categorías de productos con soporte para jerarquía
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(150) UNIQUE NOT NULL,
    parent_id UUID,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT slug_format_check CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Índices
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Comentarios
COMMENT ON TABLE categories IS 'Categorías de productos con soporte para jerarquía (parent_id)';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier para SEO';
COMMENT ON COLUMN categories.parent_id IS 'Autoreferencia para crear jerarquía de categorías';

-- =====================================================
-- TABLA: products
-- Catálogo de productos
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    category_id UUID NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT price_positive_check CHECK (price > 0),
    CONSTRAINT stock_non_negative_check CHECK (stock_quantity >= 0)
);

-- Índices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_price ON products(price);

-- Comentarios
COMMENT ON TABLE products IS 'Catálogo de productos disponibles para venta';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - Identificador único de negocio';
COMMENT ON COLUMN products.price IS 'Precio en formato decimal para evitar errores de redondeo';
COMMENT ON COLUMN products.stock_quantity IS 'Cantidad disponible en inventario';

-- =====================================================
-- TABLA: carts
-- Carritos de compra temporales
-- =====================================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    status cart_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_status ON carts(status);

-- Comentarios
COMMENT ON TABLE carts IS 'Carritos de compra temporales (un usuario solo tiene un carrito activo)';
COMMENT ON COLUMN carts.status IS 'Estado del carrito: active, completed (convertido a orden), abandoned';

-- =====================================================
-- TABLA: cart_items
-- Items individuales dentro del carrito
-- =====================================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    price_at_addition DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) 
        REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT quantity_positive_check CHECK (quantity > 0),
    CONSTRAINT unique_cart_product UNIQUE(cart_id, product_id)
);

-- Índices
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Comentarios
COMMENT ON TABLE cart_items IS 'Items individuales del carrito con snapshot de precio';
COMMENT ON COLUMN cart_items.price_at_addition IS 'Snapshot del precio al agregar (inmutabilidad)';
COMMENT ON COLUMN cart_items.quantity IS 'Cantidad del producto en el carrito';

-- =====================================================
-- TABLA: orders
-- Órdenes/pedidos confirmados
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending' NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT total_non_negative_check CHECK (total_amount >= 0)
);

-- Índices
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Comentarios
COMMENT ON TABLE orders IS 'Órdenes confirmadas con snapshot de datos de envío (inmutabilidad)';
COMMENT ON COLUMN orders.order_number IS 'Identificador amigable para usuarios (ej: ORD-2024-0001)';
COMMENT ON COLUMN orders.total_amount IS 'Total desnormalizado para performance en consultas';

-- =====================================================
-- TABLA: order_items
-- Items de cada orden (histórico inmutable)
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT item_quantity_positive_check CHECK (quantity > 0),
    CONSTRAINT unit_price_positive_check CHECK (unit_price >= 0),
    CONSTRAINT subtotal_non_negative_check CHECK (subtotal >= 0)
);

-- Índices
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Comentarios
COMMENT ON TABLE order_items IS 'Items de orden con snapshots de producto (histórico inmutable)';
COMMENT ON COLUMN order_items.product_name IS 'Snapshot del nombre del producto';
COMMENT ON COLUMN order_items.product_sku IS 'Snapshot del SKU del producto';
COMMENT ON COLUMN order_items.subtotal IS 'Desnormalización para performance (quantity * unit_price)';

-- =====================================================
-- TABLA: payments
-- Registro de transacciones de pago
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL,
    payment_method payment_method NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT payment_amount_positive_check CHECK (amount > 0)
);

-- Índices
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Comentarios
COMMENT ON TABLE payments IS 'Registro de transacciones de pago con trazabilidad';
COMMENT ON COLUMN payments.transaction_id IS 'ID proporcionado por el proveedor de pago externo';
COMMENT ON COLUMN payments.payment_date IS 'Fecha de aprobación del pago';

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at en todas las tablas
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN: Generar número de orden único
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    order_count INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Contar órdenes del año actual
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    sequence_part := LPAD((order_count + 1)::TEXT, 6, '0');
    
    RETURN 'ORD-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number() IS 'Genera número de orden único: ORD-YYYY-000001';

-- =====================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================

-- Roles iniciales del sistema
INSERT INTO roles (name, display_name, description) VALUES
    ('customer', 'Cliente', 'Usuario regular que puede realizar compras en la tienda'),
    ('admin', 'Administrador', 'Usuario con acceso completo al sistema para gestión');

-- Usuario administrador por defecto
-- Contraseña: Admin123! (debe cambiarse en producción)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active)
SELECT 
    'admin@davistore.com',
    '$2a$10$Q3uowowEqEpcUbEC4yfmsuS/yyNcoUGp9cIZ5s/ARGVt8i5Cat1Lq', -- Hash de 'Admin123!'
    'Admin',
    'DaviStore',
    id,
    true
FROM roles WHERE name = 'admin';

-- Categorías iniciales
INSERT INTO categories (name, description, slug, parent_id, is_active) VALUES
    ('Electrónica', 'Dispositivos y accesorios electrónicos', 'electronica', NULL, true),
    ('Ropa', 'Prendas de vestir y accesorios', 'ropa', NULL, true),
    ('Hogar', 'Artículos para el hogar', 'hogar', NULL, true),
    ('Deportes', 'Artículos deportivos y fitness', 'deportes', NULL, true),
    ('Libros', 'Libros y material de lectura', 'libros', NULL, true);

-- Subcategorías (ejemplo)
INSERT INTO categories (name, description, slug, parent_id, is_active)
SELECT 
    'Smartphones', 
    'Teléfonos inteligentes', 
    'smartphones', 
    id, 
    true
FROM categories WHERE slug = 'electronica';

INSERT INTO categories (name, description, slug, parent_id, is_active)
SELECT 
    'Laptops', 
    'Computadoras portátiles', 
    'laptops', 
    id, 
    true
FROM categories WHERE slug = 'electronica';

-- Productos de ejemplo
INSERT INTO products (sku, name, description, price, stock_quantity, category_id, is_active)
SELECT 
    'ELEC-001',
    'Smartphone Galaxy X10',
    'Smartphone de última generación con pantalla AMOLED de 6.5 pulgadas y cámara de 108MP',
    799.99,
    50,
    id,
    true
FROM categories WHERE slug = 'smartphones';

INSERT INTO products (sku, name, description, price, stock_quantity, category_id, is_active)
SELECT 
    'ELEC-002',
    'Laptop ProBook 15',
    'Laptop profesional con procesador Intel i7, 16GB RAM y SSD de 512GB',
    1299.99,
    30,
    id,
    true
FROM categories WHERE slug = 'laptops';

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW v_products_with_category AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.image_url,
    p.is_active,
    c.name AS category_name,
    c.slug AS category_slug,
    p.created_at,
    p.updated_at
FROM products p
INNER JOIN categories c ON p.category_id = c.id;

-- Vista: Órdenes con información de usuario y rol
CREATE OR REPLACE VIEW v_orders_with_user AS
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    u.email AS user_email,
    u.first_name,
    u.last_name,
    r.name AS user_role,
    r.display_name AS user_role_display,
    o.total_amount,
    o.status,
    o.shipping_address,
    o.shipping_city,
    o.shipping_postal_code,
    o.shipping_country,
    o.created_at,
    o.updated_at
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN roles r ON u.role_id = r.id;

-- Vista: Usuarios con información de rol
CREATE OR REPLACE VIEW v_users_with_role AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.is_active,
    r.id AS role_id,
    r.name AS role_name,
    r.display_name AS role_display_name,
    r.description AS role_description,
    u.created_at,
    u.updated_at
FROM users u
INNER JOIN roles r ON u.role_id = r.id;

-- =====================================================
-- VERIFICACIÓN DE INTEGRIDAD
-- =====================================================

-- Mostrar resumen de tablas creadas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar roles creados
SELECT 
    name,
    display_name,
    description
FROM roles
ORDER BY 
    CASE name
        WHEN 'admin' THEN 1
        WHEN 'customer' THEN 2
        ELSE 3
    END;

-- Verificar usuario admin
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.name AS role,
    r.display_name AS role_display
FROM users u
INNER JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@davistore.com';

-- Script completado exitosamente
SELECT 'Database schema created successfully!' AS message;

