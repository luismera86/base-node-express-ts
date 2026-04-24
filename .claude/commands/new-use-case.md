# Crear nuevo caso de uso

Agrega un caso de uso a un módulo existente. Recibe `<modulo> <nombre-caso>` como argumentos: $ARGUMENTS

## Pasos a seguir en orden

1. **Ejecutar el script de generación**:
   ```bash
   npm run create:use-case $ARGUMENTS
   ```

2. **Verificar** que el archivo generado en `src/modules/<modulo>/use-cases/<nombre-caso>.use-case.ts` sigue las convenciones:
   - Función exportada en camelCase
   - Usa `prisma` directamente (no repositories)
   - Usa `LoggerService` de `common/utils/logger.util`
   - Lanza excepciones de `src/exceptions/exceptions.ts`
   - No usa clases

3. **Conectar el use case** al controller del módulo (`<modulo>.controller.ts`):
   - Importar la función
   - Crear la función controladora correspondiente

4. **Agregar la ruta** en `<modulo>.router.ts` con el método HTTP correcto.

5. **Crear o actualizar el test** del use case en `src/modules/<modulo>/`.

6. **Ejecutar los tests** para verificar que todo funciona:
   ```bash
   npm test
   ```
