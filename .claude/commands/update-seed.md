# Actualizar todos los seeds

Revisa todos los seeds existentes y los sincroniza con los cambios en sus schemas de Prisma y Zod.

## Pasos a seguir en orden

### 1. Detectar todos los seeds existentes

```bash
ls src/seeds/*.seed.ts
```

Si no existe ningún seed, informar al usuario y sugerir usar `/new-seed <modulo>` para crear el primero.

### 2. Por cada seed encontrado, leer en paralelo

Para cada archivo `src/seeds/<modulo>.seed.ts`, leer simultáneamente:

- **Schema Prisma**: `prisma/schema/<modulo>.prisma`
- **Schema Zod**: `src/modules/<modulo>/schemas/<modulo>.schema.ts`
- **Seed actual**: `src/seeds/<modulo>.seed.ts`

Si el schema de Prisma o el módulo no existe para algún seed (módulo eliminado), advertirlo y omitir ese seed.

### 3. Detectar diferencias por cada módulo

Comparar los campos del modelo Prisma contra los campos usados en el seed:

| Situación | Acción |
|-----------|--------|
| Campo nuevo en Prisma que no está en el seed | Agregar con faker apropiado |
| Campo eliminado de Prisma que sigue en el seed | Eliminar del seed |
| Campo cambió de tipo (ej: String → Int) | Actualizar el generador faker |
| Campo pasó de requerido a opcional o viceversa | Ajustar si aplica |
| Nueva restricción en Zod (min, max, email, uuid) | Ajustar faker para cumplirla |

Mostrar un resumen de diferencias detectadas para **todos** los módulos antes de modificar cualquier archivo:

```
📋 Resumen de cambios detectados:
  user.seed.ts   → 1 campo nuevo (phone), 1 campo eliminado (username)
  product.seed.ts → sin cambios
  order.seed.ts  → 2 campos nuevos (total, status)
```

Preguntar: **¿Aplicar todos los cambios? (s/n)**

### 4. Actualizar cada seed con cambios

Para cada seed que tenga diferencias, aplicar los cambios manteniendo:
- La estructura general del archivo (`seedNombre`, `TOTAL`, `createMany`)
- Los campos que no cambiaron tal como estaban
- `fakerES` como locale (faker v10+)
- Passwords hasheadas con argon2id si el modelo tiene campo `password`
- `skipDuplicates: true` en el `createMany`
- Sin incluir campos automáticos: `id`, `created_at`, `updated_at`, `deleted_at`

### 5. Verificar que compila

```bash
npm run build
```

Si falla, mostrar el error y corregir antes de terminar.

### 6. Confirmar al usuario

Mostrar por cada seed modificado:
- Campos agregados
- Campos eliminados
- Campos modificados

Y recordar ejecutar `npx ts-node src/seeds/seed.ts` para verificar que los datos se insertan correctamente.
