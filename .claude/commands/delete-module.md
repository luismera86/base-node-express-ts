# Eliminar módulo

Elimina un módulo completo y todos sus artefactos asociados. Recibe el nombre del módulo como argumento: $ARGUMENTS

## Pasos a seguir en orden

1. **Verificar que el módulo existe**:
    - Confirmar que existe `src/modules/$ARGUMENTS/`
    - Si no existe, informar al usuario y detener.

2. **Eliminar la carpeta del módulo**:

    ```bash
    rm -rf src/modules/$ARGUMENTS
    ```

3. **Eliminar el schema de Prisma** `prisma/schema/$ARGUMENTS.prisma` si existe:

    ```bash
    rm -f prisma/schema/$ARGUMENTS.prisma
    ```

    - Si existía el schema, crear una migración para eliminar la tabla:
        ```bash
        npx prisma migrate dev --name remove-$ARGUMENTS-model --create-only
        ```
    - Recordar al usuario que revise la migración antes de aplicarla.

4. **Eliminar los docs OpenAPI** `src/docs/paths/$ARGUMENTS/` si existe:

    ```bash
    rm -rf src/docs/paths/$ARGUMENTS
    ```

    - Si había un archivo de docs registrado (importado en el archivo principal de docs), eliminarlo también de ahí.

5. **Eliminar el cron job del módulo** si existe `src/modules/$ARGUMENTS/$ARGUMENTS.job.ts` (ya eliminado en paso 2):
    - Buscar en `src/cron-jobs/index.ts` si hay imports o referencias al job del módulo y eliminarlos.

6. **Limpiar el router** `src/common/router/router.ts`:
    - Buscar y eliminar cualquier import que referencie el router del módulo.
    - Eliminar la línea donde se registra la ruta del módulo.

7. **Confirmar al usuario** qué archivos fueron eliminados y recordarle:
    - Revisar la migración generada antes de aplicarla (si aplica).
    - Ejecutar `npm test` para verificar que no quedan referencias rotas.
    - Ejecutar `npx prisma generate` si se modificó algún schema.
