# Crear middleware

Crea un middleware siguiendo las convenciones del proyecto. Recibe el nombre en kebab-case como argumento: $ARGUMENTS

## Pasos a seguir en orden

### 1. Determinar el tipo de middleware

Preguntar al usuario:

> **¿Qué tipo de middleware necesitas?**
>
> 1. **Directo** — función simple `(req, res, next)`
> 2. **Factory** — función que recibe parámetros y retorna el middleware `(params) => (req, res, next)`

### 2. Determinar el ámbito de uso

Preguntar al usuario:

> **¿Dónde se va a usar?**
>
> 1. **Global** — se aplica a todas las rutas (se registra en `src/config/server.config.ts`)
> 2. **Por ruta** — se importa directamente en el router del módulo que lo necesite

### 3. Crear el archivo del middleware

Ruta: `src/common/middlewares/$ARGUMENTS.middleware.ts`

**Plantilla para middleware directo:**

```typescript
import { NextFunction, Request, Response } from "express";

export const $ARGUMENTS_CAMELCASE = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // lógica del middleware
        next();
    } catch (error) {
        next(error);
    }
};
```

**Plantilla para middleware factory:**

```typescript
import { NextFunction, Request, Response } from "express";

export const $ARGUMENTS_CAMELCASE = (/* parámetros */) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // lógica del middleware
            next();
        } catch (error) {
            next(error);
        }
    };
};
```

- Convertir `$ARGUMENTS` de kebab-case a camelCase para el nombre de la función exportada.
- Agregar los imports necesarios según la lógica (excepciones desde `src/exceptions/exceptions.ts`, prisma desde `src/config/prisma.config.ts`, etc.).

### 4. Registrar si es global

Si el usuario eligió **global**, agregar el import y el `this.app.use(...)` en el método `middleware()` de `src/config/server.config.ts`, respetando el orden existente:

```typescript
import { $ARGUMENTS_CAMELCASE } from "../common/middlewares/$ARGUMENTS.middleware";
// ...
this.app.use($ARGUMENTS_CAMELCASE);        // directo
this.app.use($ARGUMENTS_CAMELCASE(...));   // factory
```

Si el usuario eligió **por ruta**, indicarle cómo importarlo en el router correspondiente:

```typescript
import { $ARGUMENTS_CAMELCASE } from "../../common/middlewares/$ARGUMENTS.middleware";
// Usar en la ruta:
router.get("/ruta", $ARGUMENTS_CAMELCASE, handler);
```

### 5. Confirmar al usuario

Mostrar:

- Archivo creado: `src/common/middlewares/$ARGUMENTS.middleware.ts`
- Si es global: confirmar que fue agregado en `server.config.ts`
- Si es por ruta: recordar importarlo en el router del módulo que lo necesite
