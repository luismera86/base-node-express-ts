# Crear nuevo módulo

Crea un módulo completo siguiendo las convenciones del proyecto. Recibe el nombre del módulo como argumento: $ARGUMENTS

## Pasos a seguir en orden

1. **Ejecutar el script de generación**:

    ```bash
    pnpm run create:module $ARGUMENTS
    ```

2. **Crear el archivo de schema Prisma** `prisma/schema/<nombre-en-kebab-case>.prisma` con la estructura base:

    ```prisma
    model <nombre_modulo> {
      id         String    @id @default(uuid())
      created_at DateTime  @default(now())
      updated_at DateTime  @updatedAt
      deleted_at DateTime?

      @@map("<nombre_modulo_plural>")
    }
    ```

    - Modelo, campos y tabla siempre en snake_case — sin `@map` en campos individuales
    - Agregar los campos del modelo según el contexto
    - No usar `enum` — usar `String` y definir el enum en `src/common/enums/`

3. **Crear la migración** (sin aplicarla):

    ```bash
    pnpm prisma migrate dev --name add-$ARGUMENTS-model --create-only
    ```

4. **Crear los docs OpenAPI**:

    ```bash
    pnpm run create:swagger-docs $ARGUMENTS
    ```

    Luego abrir `src/docs/swagger.ts` y **descomentar** (o agregar si no existen) las líneas del módulo:

    ```typescript
    import { <Nombre>Schema } from "../modules/$ARGUMENTS/schemas/$ARGUMENTS.schema";
    import { <Nombre>Paths } from "./paths/$ARGUMENTS/$ARGUMENTS.paths";
    // ...
    registry.register("<Nombre>", <Nombre>Schema);
    new <Nombre>Paths().register();
    ```

    El script las genera comentadas — hay que activarlas manualmente en `swagger.ts`.

    **Importante**: si el módulo no es CRUD estándar (ej: auth, payments), crear los archivos de docs manualmente en `src/docs/paths/<modulo>/` con un path por endpoint, siguiendo la misma estructura que los módulos CRUD existentes.

5. **Crear los tests** en `src/modules/<modulo>/` con el sufijo `.spec.ts`.

6. **Opcional — carpeta de utilidades del módulo**: si el módulo necesita lógica auxiliar propia (helpers, transformadores, etc.), crear `src/modules/<modulo>/utils/` o `src/modules/<modulo>/helpers/`. Solo si es necesario; si la utilidad puede ser reutilizada en otros módulos, moverla a `src/common/utils/` en su lugar.

7. **Opcional — cron job del módulo**: si el módulo requiere tareas programadas, crear `src/modules/<modulo>/<modulo>.job.ts` con la estructura base de `node-cron` y registrarlo en `src/cron-jobs/index.ts`.

8. Confirmar al usuario qué archivos se generaron y recordarle que debe:
    - Revisar la migración antes de aplicarla
