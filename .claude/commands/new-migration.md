# Crear y ejecutar migración de Prisma

Crea una migración, muestra el SQL generado y opcionalmente la ejecuta. Recibe el nombre descriptivo como argumento: $ARGUMENTS

## Pasos a seguir en orden

### 1. Verificar el estado del schema

Ejecutar:

```bash
pnpm prisma validate
```

Si falla, mostrar el error y detener — el schema tiene errores que corregir primero.

### 2. Crear la migración sin aplicarla

```bash
pnpm prisma migrate dev --name $ARGUMENTS --create-only
```

### 3. Mostrar el SQL generado

Leer y mostrar el contenido del archivo `migration.sql` de la migración recién creada en `prisma/migrations/`.

Verificar que el SQL tiene sentido según los cambios del schema:

- ¿Crea las tablas/columnas esperadas?
- ¿Hay operaciones destructivas (`DROP`, `ALTER ... DROP COLUMN`) que puedan borrar datos?
- ¿Los tipos de datos son correctos?

Si hay operaciones destructivas, advertirlo explícitamente al usuario antes de continuar.

### 4. Preguntar si aplicar en local

> **¿Deseas aplicar esta migración en local ahora? (s/n)**

- Si responde **no**: recordar que puede aplicarla después con `pnpm prisma migrate dev` y terminar.
- Si responde **sí**: continuar al paso 5.

### 5. Aplicar la migración

```bash
pnpm prisma migrate dev
```

Si falla, mostrar el error completo. No intentar rollback automático — explicar al usuario qué salió mal.

### 6. Regenerar el Prisma Client

```bash
pnpm prisma generate
```

### 7. Confirmar al usuario

Mostrar:

- Nombre de la migración aplicada
- Tablas/columnas afectadas (resumen del SQL)
- Recordar que nunca se debe editar una migración ya aplicada — crear una nueva en su lugar
