# 🛒 Estrategias de Carrito de Compras - Análisis

## 🎯 Pregunta del Usuario

> "¿Solo los usuarios registrados y logueados tienen carrito guardado? ¿Los usuarios invitados deben loguearse para agregar items?"

## 📊 Diseño Actual vs Alternativas

---

## ✅ OPCIÓN 1: Solo Usuarios Autenticados (Actual)

### Cómo Funciona

```
Usuario NO logueado:
├─ Navega productos ✅
├─ Ve detalles ✅
├─ Click en "Agregar al carrito" 
└─ → Redirige a LOGIN ❌

Usuario logueado:
├─ Navega productos ✅
├─ Click en "Agregar al carrito"
└─ → Se guarda en BD ✅
```

### Base de Datos

```sql
-- Tabla actual
CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,  -- Requiere usuario
    status cart_status,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Ventajas ✅

- **Simplicidad**: Menos lógica de negocio
- **Seguridad**: Todo está autenticado
- **Performance**: Menos datos en BD
- **Sin carritos huérfanos**: Solo carritos de usuarios reales

### Desventajas ❌

- **UX pobre**: Obliga a login antes de explorar
- **Menor conversión**: Fricción en el proceso
- **No permite "explorar antes de comprar"**
- **Usuarios pierden items** si no están logueados

### Flujo Frontend (React/Vue)

```typescript
// ProductCard.tsx
const handleAddToCart = async () => {
  if (!isAuthenticated) {
    // Mostrar modal: "Inicia sesión para guardar"
    showLoginModal();
    return;
  }
  
  // Usuario autenticado - guardar en BD
  await api.post('/cart/items', { product_id, quantity });
  showSuccess('Producto agregado');
};
```

### Cuándo Usar

- ✅ Productos de alta consideración (B2B, software)
- ✅ Marketplace con verificación de usuarios
- ✅ Productos que requieren aprobación
- ❌ E-commerce masivo (Amazon, MercadoLibre)

---

## 🎯 OPCIÓN 2: Carrito Híbrido (Recomendado para E-commerce)

### Cómo Funciona

```
Usuario NO logueado:
├─ Navega productos ✅
├─ Agrega al carrito → localStorage/sessionStorage ✅
├─ Ve su carrito temporal ✅
└─ Al hacer checkout → Pide login + migra carrito ✅

Usuario logueado:
├─ Carrito persiste en BD ✅
├─ Sincroniza entre dispositivos ✅
└─ Recupera carrito si cierra navegador ✅
```

### Base de Datos (Modificada)

```sql
-- Opción A: Mantener tabla actual + lógica en frontend
CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE,  -- Puede ser NULL para invitados
    session_id VARCHAR(255),  -- ID de sesión para invitados
    status cart_status,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_user_or_session UNIQUE (user_id, session_id)
);

-- Opción B: Separar carritos de invitados (mejor)
CREATE TABLE guest_carts (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,  -- Limpiar carritos viejos
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE guest_cart_items (
    id UUID PRIMARY KEY,
    guest_cart_id UUID NOT NULL REFERENCES guest_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_addition DECIMAL(10,2),
    created_at TIMESTAMP,
    UNIQUE(guest_cart_id, product_id)
);
```

### Ventajas ✅

- **UX excelente**: Sin fricción inicial
- **Mayor conversión**: Usuarios exploran libremente
- **Migración transparente**: Carrito invitado → usuario
- **Mejor para e-commerce masivo**

### Desventajas ❌

- **Más complejo**: Lógica de migración
- **Carritos huérfanos**: Invitados que nunca compran
- **Limpieza necesaria**: Jobs para borrar carritos expirados
- **Más código**: Frontend + backend

### Flujo Frontend (React)

```typescript
// useCart.ts (Custom Hook)
import { v4 as uuidv4 } from 'uuid';

const useCart = () => {
  const { user, isAuthenticated } = useAuth();
  
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      // Usuario autenticado - guardar en BD
      await api.post('/cart/items', { product_id: productId, quantity });
    } else {
      // Usuario invitado - guardar en localStorage
      const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      const existingItem = cart.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ productId, quantity, addedAt: Date.now() });
      }
      
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  };

  const migrateGuestCart = async () => {
    // Al hacer login, migrar carrito de localStorage a BD
    const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    
    if (guestCart.length > 0) {
      await api.post('/cart/migrate', { items: guestCart });
      localStorage.removeItem('guest_cart');
    }
  };

  return { addToCart, migrateGuestCart };
};
```

### Backend (CartService.ts)

```typescript
class CartService {
  async migrateGuestCart(userId: string, guestItems: GuestCartItem[]) {
    // 1. Obtener o crear carrito del usuario
    const userCart = await this.getOrCreateCart(userId);
    
    // 2. Por cada item del carrito invitado
    for (const item of guestItems) {
      // Validar stock
      const product = await productRepository.findById(item.productId);
      if (!product || product.stock_quantity < item.quantity) {
        continue; // Skip si no hay stock
      }
      
      // Agregar o actualizar en carrito del usuario
      await this.addItemToCart(userCart.id, item.productId, item.quantity);
    }
  }
}
```

### Cuándo Usar

- ✅ E-commerce masivo (mayoría de casos)
- ✅ Tiendas retail online
- ✅ Marketplace abierto
- ✅ Cualquier sitio que quiera maximizar conversión

---

## 🚀 OPCIÓN 3: Carrito Completamente en Frontend (Simple)

### Cómo Funciona

```
Todos los usuarios:
├─ Carrito SOLO en localStorage ✅
├─ No se guarda en BD hasta checkout ✅
└─ Al confirmar orden → Crea orden + items ✅
```

### Base de Datos

```sql
-- NO hay tabla carts ni cart_items
-- Solo orders + order_items

-- Los usuarios agregan productos a localStorage
-- Al hacer checkout, se crea la orden directamente
```

### Ventajas ✅

- **Máxima simplicidad**: Sin tabla de carrito
- **Sin limpieza**: No hay carritos abandonados en BD
- **Menos queries**: Todo en frontend hasta checkout
- **Escalabilidad**: Cero carga en BD para carritos

### Desventajas ❌

- **No persiste**: Si cambias de dispositivo, pierdes carrito
- **No sincroniza**: Un carrito por navegador
- **Sin analytics**: Difícil analizar carritos abandonados
- **Limitado**: No puedes guardar carrito a largo plazo

### Flujo Frontend

```typescript
// cartStore.ts (Zustand/Redux)
const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  
  addItem: (product, quantity) => {
    const items = [...get().items];
    const existing = items.find(i => i.id === product.id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  
  checkout: async () => {
    const items = get().items;
    
    // Crear orden directamente
    const order = await api.post('/orders', {
      items: items.map(i => ({
        product_id: i.id,
        quantity: i.quantity
      })),
      shipping_address: {...}
    });
    
    // Limpiar carrito
    localStorage.removeItem('cart');
    set({ items: [] });
    
    return order;
  }
}));
```

### Cuándo Usar

- ✅ MVP rápido
- ✅ Tiendas muy pequeñas
- ✅ Productos de compra impulsiva
- ❌ E-commerce serio (necesitas analytics)

---

## 📊 Comparación de Estrategias

| Característica | Solo Auth | Híbrido | Solo Frontend |
|----------------|-----------|---------|---------------|
| **Complejidad** | Baja | Media | Muy Baja |
| **UX** | Pobre | Excelente | Buena |
| **Conversión** | Baja | Alta | Media |
| **Persistencia** | Sí | Sí | No |
| **Analytics** | Sí | Sí | No |
| **Multi-device** | Sí | Sí (auth) | No |
| **BD Load** | Bajo | Medio | Mínimo |
| **Mantenimiento** | Bajo | Medio | Bajo |

---

## 🎯 Recomendación para DaviStore

### Para Prueba Técnica / MVP

**Usa OPCIÓN 1 (actual)** porque:
- ✅ Ya está diseñada
- ✅ Simple de implementar
- ✅ Demuestra conocimiento de BD
- ✅ Suficiente para demostrar habilidades

**Mejora sugerida:** Agregar mensaje claro en frontend
```typescript
// Si no está autenticado
"Para agregar productos al carrito, por favor inicia sesión"
```

### Para Producción Real

**Usa OPCIÓN 2 (híbrido)** porque:
- ✅ Mejor UX
- ✅ Mayor conversión
- ✅ Estándar de la industria
- ✅ Analytics completos

---

## 🔄 Migración: Opción 1 → Opción 2

Si decides implementar carritos invitados después:

```sql
-- Migración 004: Agregar carritos de invitados
CREATE TABLE guest_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guest_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_addition DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_guest_cart FOREIGN KEY (guest_cart_id) 
        REFERENCES guest_carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_guest_cart_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT unique_guest_cart_product UNIQUE(guest_cart_id, product_id)
);

-- Job para limpiar carritos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_guest_carts()
RETURNS void AS $$
BEGIN
    DELETE FROM guest_carts WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE guest_carts IS 'Carritos temporales para usuarios no autenticados';
COMMENT ON COLUMN guest_carts.session_id IS 'UUID de sesión del frontend (localStorage)';
COMMENT ON COLUMN guest_carts.expires_at IS 'Fecha de expiración (auto-limpieza)';
```

---

## 💡 Resumen

### Tu Pregunta Original

> "¿Usuarios invitados necesitan loguearse para usar el carrito?"

**Respuesta:**
- **Diseño Actual**: Sí, requiere login
- **Alternativa Recomendada**: Carrito híbrido (invitados en frontend, usuarios en BD)
- **Para la prueba técnica**: El diseño actual está bien, solo documenta el comportamiento

### Mi Recomendación

```
Fase 1 (Ahora - Prueba Técnica):
└─ Usar diseño actual (solo usuarios autenticados)
   └─ Agregar mensaje claro: "Inicia sesión para guardar tu carrito"

Fase 2 (Futuro - Si lo quieres mejorar):
└─ Implementar carrito híbrido
   ├─ localStorage para invitados
   ├─ BD para usuarios autenticados
   └─ Migración al hacer login
```

---

¿Quieres que implemente el carrito híbrido ahora, o prefieres mantener el diseño simple para la prueba técnica?

