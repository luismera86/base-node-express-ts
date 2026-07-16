# Crear modelo de Prisma

Crea un archivo `.prisma` independiente para un nuevo modelo. Recibe el nombre del modelo en PascalCase como argumento: $ARGUMENTS

## Convención obligatoria de nombres

- **Modelo Prisma**: snake_case (e.g. `user_profile`)
- **Tabla (`@@map`)**: snake_case en plural (e.g. `user_profiles`)
- **Campos Prisma y columnas DB**: snake_case directamente (e.g. `first_name`) — sin usar `@map`

No usar `@map` en campos individuales. El nombre del campo en el schema ya es snake_case, por lo que coincide directamente con la columna en la BD.

## Pasos a seguir en orden

1. **Crear el archivo** `prisma/schema/<nombre-en-kebab-case>.prisma` con la estructura base:

```prisma
model <nombre_en_snake_case> {
  id         String    @id @default(uuid())
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@map("<nombre-tabla-en-snake_case-plural>")
}
```

- Agregar los campos del modelo directamente en snake_case
- No usar `enum` — usar `String` para campos de tipo enumerado y definir el enum en `src/common/enums/`
- Si el modelo necesita relaciones, agregarlas respetando la sintaxis de Prisma

**Ejemplo completo:**

```prisma
model user_profile {
  id         String    @id @default(uuid())
  first_name String
  last_name  String
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@map("user_profiles")
}
```

2. **Validar** que el schema conjunto es correcto:

    ```bash
    pnpm prisma validate
    ```

3. **Crear la migración** (sin aplicarla):

    ```bash
    pnpm prisma migrate dev --name add-<nombre-en-kebab-case> --create-only
    ```

4. Mostrar el SQL generado en `prisma/migrations/` para que el usuario lo revise.

5. Recordar al usuario:
    - Revisar el SQL antes de aplicar la migración
    - Crear el módulo correspondiente con `pnpm run create:module <nombre>`
    - Si hay enums, crearlos en `src/common/enums/`
