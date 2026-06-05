# Crear test de integración

Crea un test de integración HTTP para un módulo usando supertest. Recibe el nombre del módulo como argumento: $ARGUMENTS

## Pasos a seguir en orden

### 1. Localizar el router del módulo

Leer `src/modules/$ARGUMENTS/$ARGUMENTS.router.ts` para mapear:

- Todos los endpoints (método HTTP + path)
- Middlewares de autenticación o validación aplicados
- Body/params/query esperados en cada ruta

### 2. Verificar que existe el directorio `test/`

```bash
ls test/
```

Si no existe, crearlo:

```bash
mkdir -p test
```

### 3. Crear el archivo de test

Ruta: `test/$ARGUMENTS.test.ts`

**Plantilla base:**

```typescript
import { describe, it, expect, beforeAll, beforeEach, vi, type Mock } from "vitest";
import request from "supertest";
import express from "express";
import { createBaseRouter } from "../src/common/router/router";
import { customExceptions } from "../src/exceptions/custom-exceptions";
import { prisma } from "../src/config/prisma.config";

vi.mock("../src/config/prisma.config", () => ({
    prisma: {
        <model>: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use("/api", createBaseRouter());
    app.use(customExceptions);
    return app;
};

describe("$ARGUMENTS endpoints", () => {
    let app: express.Application;

    beforeAll(() => {
        app = buildApp();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /api/$ARGUMENTS", () => {
        it("should return 200 with list", async () => {
            (prisma.<model>.findMany as Mock).mockResolvedValue([]);

            const res = await request(app).get("/api/$ARGUMENTS");

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    describe("POST /api/$ARGUMENTS", () => {
        it("should return 201 when data is valid", async () => {
            const payload = { /* campos requeridos */ };
            const created = { id: "uuid-fake", ...payload };
            (prisma.<model>.create as Mock).mockResolvedValue(created);

            const res = await request(app)
                .post("/api/$ARGUMENTS")
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject(created);
        });

        it("should return 400 when body is invalid", async () => {
            const res = await request(app)
                .post("/api/$ARGUMENTS")
                .send({});

            expect(res.status).toBe(400);
        });
    });

    // Agregar un describe por cada endpoint adicional del módulo
});
```

- Reemplazar los placeholders con los valores reales del router leído en el paso 1.
- Montar solo las capas necesarias (no levantar el servidor completo ni conectar a BD real).
- Si hay rutas protegidas con `passportCall` u otro middleware de auth, mockearlos:
    ```typescript
    vi.mock("../src/common/middlewares/passport.middleware", () => ({
        passportCall: () => (req: any, res: any, next: any) => {
            req.user = { id: "user-fake-id" };
            next();
        },
    }));
    ```
- Cubrir al menos: happy path + validación fallida + not found (si aplica).

### 4. Verificar que los tests corren

```bash
npx vitest run test/$ARGUMENTS.test.ts
```

Si fallan, corregir antes de terminar.

### 5. Confirmar al usuario

Mostrar:

- Archivo creado
- Endpoints cubiertos y escenarios testeados
