# Crear modelo de Prisma

Crea un archivo `.prisma` independiente para un nuevo modelo. Recibe el nombre del modelo en PascalCase como argumento: $ARGUMENTS

## Pasos a seguir en orden

1. **Crear el archivo** `prisma/schema/<nombre-en-kebab-case>.prisma` con la estructura base:

```prisma
model $ARGUMENTS {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

   - Agregar los campos específicos del modelo según el contexto
   - No usar `enum` — usar `String` para campos de tipo enumerado y definir el enum en `src/common/enums/`
   - Si el modelo necesita relaciones, agregarlas respetando la sintaxis de Prisma

2. **Validar** que el schema conjunto es correcto:
   ```bash
   npx prisma validate
   ```

3. **Crear la migración** (sin aplicarla):
   ```bash
   npx prisma migrate dev --name add-<nombre-en-kebab-case> --create-only
   ```

4. Mostrar el SQL generado en `prisma/migrations/` para que el usuario lo revise.

5. Recordar al usuario:
   - Revisar el SQL antes de aplicar la migración
   - Crear el módulo correspondiente con `npm run create:module <nombre>`
   - Si hay enums, crearlos en `src/common/enums/`
