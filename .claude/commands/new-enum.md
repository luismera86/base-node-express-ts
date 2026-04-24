# Crear enum

Crea un enum de TypeScript en la carpeta `common/enums`. Recibe el nombre del enum como argumento: $ARGUMENTS

## Pasos a seguir

1. **Crear el archivo** `src/common/enums/$ARGUMENTS.enum.ts` con la estructura:
   ```ts
   export enum <NombreEnum> {
     // valores
   }
   ```

2. **Recordar la regla**: los enums **nunca** van en los modelos de Prisma. En el schema usar `String`, y referenciar este enum solo a nivel de código TypeScript (validaciones Zod, lógica de negocio).

3. Si el enum está relacionado con un campo de un modelo Prisma existente, mostrar un ejemplo de cómo validarlo con Zod:
   ```ts
   z.nativeEnum(<NombreEnum>)
   ```

4. Confirmar la ruta del archivo creado.
