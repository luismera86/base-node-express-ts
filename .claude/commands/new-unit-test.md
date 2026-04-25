# Crear test unitario

Crea un test unitario para un use case o función del módulo indicado. Recibe `<modulo> <use-case>` como argumentos: $ARGUMENTS

El primer argumento es el módulo y el segundo es el nombre del use case (en kebab-case). Ejemplo: `user create-user`.

## Pasos a seguir en orden

### 1. Localizar el use case a testear

Leer el archivo `src/modules/<modulo>/use-cases/<use-case>.use-case.ts` para entender:

- Qué parámetros recibe la función
- Qué modelos de Prisma usa (`prisma.<model>.<method>`)
- Qué retorna en éxito
- Qué excepciones lanza (importadas de `src/exceptions/exceptions.ts`)

### 2. Crear el archivo de test

Ruta: `src/modules/<modulo>/<modulo>.spec.ts`

Si ya existe el archivo (el módulo tiene tests), agregar el nuevo `describe` al final del archivo existente en lugar de crear uno nuevo.

**Plantilla base:**

```typescript
import { <useCaseFn> } from "./use-cases/<use-case>.use-case";
import { prisma } from "../../config/prisma.config";

jest.mock("../../config/prisma.config", () => ({
    prisma: {
        <model>: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("<useCaseFn>", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should <descripción del caso feliz>", async () => {
        // Arrange
        const input = { /* datos de prueba */ };
        const expected = { /* resultado esperado */ };
        (prismaMock.<model>.<method> as jest.Mock).mockResolvedValue(expected);

        // Act
        const result = await <useCaseFn>(input);

        // Assert
        expect(prismaMock.<model>.<method>).toHaveBeenCalledWith(/* args esperados */);
        expect(result).toEqual(expected);
    });

    it("should throw <ExceptionName> when <condición de error>", async () => {
        // Arrange
        (prismaMock.<model>.<method> as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(<useCaseFn>(/* input */)).rejects.toThrow(<ExceptionName>);
    });
});
```

- Reemplazar los placeholders con los valores reales del use case leído.
- Solo mockear los métodos de Prisma que el use case realmente usa.
- Incluir al menos: un test del caso feliz y un test por cada excepción que pueda lanzar.
- Usar datos de prueba realistas (no `"test"` o `1`, sino valores con forma).

### 3. Verificar que los tests corren

```bash
npx jest src/modules/<modulo>/<modulo>.spec.ts --no-coverage
```

Si fallan, corregir antes de terminar.

### 4. Confirmar al usuario

Mostrar:

- Archivo creado o modificado
- Cantidad de tests agregados y qué cubren
