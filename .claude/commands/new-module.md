# Crear nuevo módulo

Crea un módulo completo siguiendo las convenciones del proyecto. Recibe el nombre del módulo como argumento: $ARGUMENTS

## Pasos a seguir en orden

1. **Ejecutar el script de generación**:
   ```bash
   npm run create:module $ARGUMENTS
   ```

2. **Agregar el modelo en `prisma/schema.prisma`** con la estructura base:
   - Campos mínimos: `id`, `createdAt`, `updatedAt`, `deletedAt?`
   - No usar `enum` — usar `String` y definir el enum en `src/common/enums/`

3. **Crear la migración** (sin aplicarla):
   ```bash
   npx prisma migrate dev --name add-$ARGUMENTS-model --create-only
   ```

4. **Crear el cron job** del módulo en `src/modules/<modulo>/<modulo>.job.ts` con la estructura base de `node-cron`.

5. **Crear los docs OpenAPI**:
   ```bash
   npm run create:swagger-docs $ARGUMENTS
   ```

6. **Crear los tests** en `src/modules/<modulo>/` con el sufijo `.spec.ts`.

7. Confirmar al usuario qué archivos se generaron y recordarle que debe:
   - Revisar la migración antes de aplicarla
   - Registrar el cron job en `src/cron-jobs/index.ts`
