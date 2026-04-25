# Sincronizar documentación OpenAPI

Revisa todos los módulos y corrige la documentación Swagger para que esté alineada con los schemas Prisma, Zod y los routers.

## Pasos a seguir en orden

### 1. Detectar todos los módulos existentes

```bash
ls src/modules/
```

Para cada módulo encontrado en `src/modules/` leer en paralelo:

- **Router**: `src/modules/<modulo>/<modulo>.router.ts` — para saber qué endpoints existen (método + ruta)
- **Schema Zod**: `src/modules/<modulo>/schemas/<modulo>.schema.ts` — para saber campos y tipos de DTOs
- **Schema Prisma**: `prisma/schema/<modulo>.prisma` — para saber campos del modelo
- **Docs existentes**: `src/docs/paths/<modulo>/` — todos los archivos `.path.ts` si existen
- **swagger.ts**: `src/docs/swagger.ts` — para verificar registros globales

### 2. Detectar problemas por módulo

Para cada módulo, verificar:

#### A. Carpeta de docs faltante
Si `src/docs/paths/<modulo>/` no existe → marcar como **docs ausentes**, hay que crearlas.

#### B. Registro en swagger.ts faltante
Verificar que `swagger.ts` importe y registre el schema principal y las paths del módulo:
- `registry.register("<ModuloPascalCase>", <ModuloSchema>)` — para el schema del modelo
- `new <ModuloPascalCase>Paths().register()` — para registrar los endpoints

Si falta alguno → marcar como **registro faltante en swagger.ts**.

#### C. Endpoints sin documentar
Comparar los endpoints del router contra los archivos en `src/docs/paths/<modulo>/`:

| Método router | Archivo doc esperado |
|---------------|---------------------|
| `router.get("/")` | `get-all.path.ts` |
| `router.get("/:id")` | `get-by-id.path.ts` |
| `router.post("/")` | `create.path.ts` |
| `router.patch("/:id")` | `update.path.ts` |
| `router.put("/:id")` | `update.path.ts` |
| `router.delete("/:id")` | `delete.path.ts` |

Si falta un archivo → marcarlo como **endpoint sin documentar**.

#### D. Parámetros `id` tipados como number
En cada archivo `.path.ts`, buscar parámetros de ruta `id` con `type: "number"`.
Los IDs son siempre UUID strings → deben ser `type: "string", format: "uuid"`.

#### E. Body incorrecto en PATCH/PUT
El body del endpoint de actualización debe usar el DTO de update (`UpdateXxxSchema.body`), no el schema completo de la entidad (`XxxSchema`).

#### F. Campos faltantes en el schema registrado
Comparar los campos exportados en `UserSchema` (u equivalente) contra el modelo Prisma.
Campos opcionales en Prisma (`String?`, `DateTime?`) → `z.string().nullable()` / `z.date().nullable()` en Zod.
Si hay campos del modelo Prisma que no están en el schema Zod registrado → marcarlos.

### 3. Mostrar resumen antes de modificar

```
Resumen de problemas detectados:

  user
    - [OK] Docs existen
    - [FIX] id tipado como number en get-by-id.path.ts, update.path.ts, delete.path.ts
    - [FIX] Body de update.path.ts usa UserSchema en vez de UpdateUserSchema.body

  auth
    - [OK] Docs existen
    - [OK] Todos los endpoints documentados
    - [OK] Sin problemas detectados

  orders
    - [MISSING] Carpeta src/docs/paths/orders/ no existe — crear docs desde cero
    - [MISSING] swagger.ts no registra OrdersPaths ni OrderSchema
```

Preguntar: **¿Aplicar todas las correcciones? (s/n)**

### 4. Aplicar correcciones

#### Para errores tipo D (id como number):
Reemplazar en los archivos afectados:
```typescript
// Antes
schema: { type: "number", description: "ID del ..." }

// Después
schema: { type: "string", format: "uuid", description: "ID del ..." }
```

#### Para errores tipo E (body incorrecto en PATCH):
Corregir el import y el uso del schema:
```typescript
// Antes
import { XxxSchema } from "..."
{ schema: XxxSchema }

// Después
import { UpdateXxxSchema } from "..."
{ schema: UpdateXxxSchema.body }
```

#### Para errores tipo F (campos faltantes en Zod):
Agregar los campos faltantes al schema registrado en `<modulo>.schema.ts`.
Respetar la opcionalidad: `String?` → `.nullable()`, campo obligatorio → sin nullable.

#### Para módulos con docs ausentes (tipo A):
Crear la carpeta `src/docs/paths/<modulo>/` y los archivos de cada endpoint del router:

**Estructura de un archivo path:**
```typescript
import { XxxCreateSchema } from "../../../modules/<modulo>/schemas/<modulo>.schema";
import { BasePath } from "../base.path";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export class CreateXxxPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["<modulo>"],
            method: "post",
            path: "/<modulo>",
            summary: "Crear <modulo>",
            request: {
                body: {
                    content: { "application/json": { schema: XxxCreateSchema.body } },
                },
            },
            responses: {
                201: { description: "<Modulo> creado", content: { "application/json": { schema: { $ref: "#/components/schemas/<ModuloPascalCase>" } } } },
                400: { description: "Datos inválidos" },
                401: { description: "No autorizado" },
            },
        });
    }
}
```

Crear también el archivo `<modulo>.paths.ts` que agrupe todos los endpoints:
```typescript
import { registry } from "../../swagger";
import { BasePath } from "../base.path";
import { CreateXxxPath } from "./create.path";
// ... otros imports

export class XxxPaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new CreateXxxPath(this.registry).register();
        // ... otros
    }
}
```

#### Para errores tipo B (registro faltante en swagger.ts):
Agregar en `src/docs/swagger.ts`:
```typescript
import { XxxSchema } from "../modules/<modulo>/schemas/<modulo>.schema";
import { XxxPaths } from "./paths/<modulo>/<modulo>.paths";

registry.register("<ModuloPascalCase>", XxxSchema);
new XxxPaths().register();
```

### 5. Verificar que compila

```bash
npm run build
```

Si falla, mostrar el error y corregirlo antes de terminar. No reportar éxito hasta que compile limpio.

### 6. Confirmar al usuario

Mostrar por cada módulo modificado:
- Archivos creados
- Archivos modificados y qué se cambió
- Campos agregados al schema Zod si aplica

Recordar que para ver los cambios en Swagger hay que reiniciar el servidor (`npm run dev`).
