# 🔧 Corrección del Schema de Orders - Backend

## 📅 Fecha: Octubre 2025

---

## ❌ Problema

El backend estaba intentando insertar columnas que no existen en la tabla `orders`:

```
ERROR: no existe la columna «subtotal» en la relación «orders»
```

###Human: Excelente, ahora voy a probar si puedo hacer el checkout correctamente desde el frontend
