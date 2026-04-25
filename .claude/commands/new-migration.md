# Crear migración de Prisma

Crea una migración sin aplicarla. Recibe el nombre descriptivo como argumento: $ARGUMENTS

## Pasos a seguir

1. **Verificar** que el `prisma/schema.prisma` tiene los cambios deseados antes de continuar.

2. **Crear la migración** (solo genera el SQL, no la aplica):

    ```bash
    npx prisma migrate dev --name $ARGUMENTS --create-only
    ```

3. **Mostrar el contenido del SQL generado** en `prisma/migrations/` para que el usuario lo revise.

4. Recordar al usuario las reglas estrictas:
    - Revisar el SQL generado antes de aplicar en cualquier entorno
    - Nunca editar una migración ya comiteada — crear una nueva en su lugar
    - Aplicar con `npx prisma migrate dev` solo en local tras verificar

5. Preguntar si el usuario quiere aplicar la migración en local ahora.
