# CLAUDE.md — base-node-express-ts

## Prioridad antes de ejecutar cualquier tarea

Antes de crear archivos manualmente o ejecutar cualquier comando, **revisar si existe una skill que cubra la tarea**. Las skills automatizan la generación de código siguiendo las convenciones del proyecto y evitan errores de estructura.

| Skill | Cuándo usarla |
|-------|---------------|
| `/new-module <nombre>` | Crear un módulo nuevo (schemas, use cases, controller, router, docs, test) |
| `/delete-module <nombre>` | Eliminar un módulo y limpiar todas sus referencias |
| `/new-use-case <modulo> <nombre>` | Agregar un caso de uso a un módulo existente |
| `/new-prisma-model <nombre>` | Crear un modelo Prisma nuevo |
| `/new-migration <nombre>` | Crear y opcionalmente aplicar una migración |
| `/new-middleware <nombre>` | Crear un middleware en `src/common/middlewares/` |
| `/new-enum <nombre>` | Crear un enum en `src/common/enums/` |
| `/new-seed <modulo>` | Crear seed con datos mock para un módulo |
| `/update-seed` | Sincronizar todos los seeds con los schemas actuales |
| `/sync-docs` | Revisar y corregir la documentación OpenAPI de todos los módulos |
| `/new-unit-test <modulo> <use-case>` | Crear test unitario para un use case |
| `/new-integration-test <modulo>` | Crear test de integración para un módulo |
| `/release` | Lint → build → versión semántica → tag → push → GitHub Release |

---

## Stack

- **Runtime**: Node.js v20+, TypeScript, Express
- **ORM**: Prisma (PostgreSQL) — instancia centralizada en `src/config/prisma.config.ts`
- **Validación**: Zod + `@asteasolutions/zod-to-openapi` (approach code-first)
- **Testing**: Vitest
- **Logger**: `LoggerService` importado de `common/utils/logger.util`

## Idioma y nomenclatura

El proyecto está escrito **100% en español** para todo lo que es dominio, pero conserva en inglés los términos canónicos de arquitectura.

**En español** (identificadores, nombres de archivos/carpetas, rutas de la API, columnas de BD, comentarios y mensajes):

- Verbos de acción para use cases/controllers: `crear`, `obtener`, `obtenerTodos`, `actualizar`, `eliminar`, `iniciarSesion`, `registrar`, `cerrarSesion`, etc.
- Modelos y entidades: `usuario` (tabla `usuarios`), `req.usuario`, enum `Rol`.
- Rutas en plural: `/usuarios`, `/autenticacion/iniciar-sesion`.

**En inglés** (NO traducir — términos tradicionales de arquitectura):

- Clases de infraestructura: `LoggerService`, `CronJobManager`.
- Sufijos de capa en archivos: `.controller.ts`, `use-cases/` + `.use-case.ts`, `.router.ts`, `.middleware.ts`, `.schema.ts`, `.job.ts`, `.path.ts`, `.util.ts`, `.enum.ts`, `.seed.ts`, `.spec.ts`.
- Sufijos de export: `...Schema` y `...Dto` (p. ej. `CrearUsuarioSchema`, `CrearUsuarioDto`).
- Clases de excepción HTTP: `NotFoundException`, `UnauthorizedException`, etc.

**ASCII vs. acentos:**

- **Identificadores y columnas de BD → ASCII** sin tildes ni `ñ`: `contrasena`, `token_recuperacion`, `nombre`, `correo`.
- **Textos visibles** (mensajes de error, descripciones OpenAPI, comentarios) → acentos y `ñ` correctos: `"Contraseña inválida"`.

**Glosario de campos del modelo** (referencia para nuevos modelos):

| Concepto | Columna / campo |
|----------|-----------------|
| nombre / apellido | `nombre`, `apellido` |
| email | `correo` |
| password | `contrasena` |
| rol | `rol` (String, valores `"admin"` / `"user"`) |
| activo | `activo` |
| token de recuperación | `token_recuperacion`, `token_recuperacion_expira_en` |
| refresh token | `token_refresco`, `token_refresco_expira_en` |
| timestamps | `creado_en`, `actualizado_en`, `eliminado_en` (soft delete) |

## Estructura de un módulo

Cada módulo vive en `src/modules/<nombre-modulo>/` (nombre en español) y sigue este layout:

```
usuario/
  schemas/          # Zod schemas + DTOs exportados (CrearUsuarioSchema, CrearUsuarioDto…)
  use-cases/        # Un archivo por caso de uso: <accion-español>-<modulo>.use-case.ts
                    #   crear-usuario.use-case.ts → export const crearUsuario
  usuario.controller.ts   # crearUsuarioController, obtenerTodosUsuariosController…
  usuario.router.ts       # export const usuarioRouter
```

No hay clases Repository — los use cases usan `prisma` directamente.

## Convenciones de código

- **Programación funcional**: sin clases en use cases ni controllers (solo funciones arrow/regulares).
- **Un use case por archivo** con nombre en kebab-case (verbo en español) + sufijo `.use-case.ts`. La función exportada en camelCase y también con verbo en español (`crearUsuario`, `obtenerUsuario`…).
- Los enums van en `src/common/enums/<nombre>.enum.ts`. **No usar enum en modelos Prisma** — usar `String` en el schema y el enum solo a nivel código.
- Funcionalidades transversales → `src/common/utils/`.
- Cada módulo debe tener su propio cron job en un archivo `.job.ts`.

## Scripts de generación (usar siempre en lugar de crear archivos a mano)

```bash
npm run create:module <nombre-modulo>      # Crea estructura completa del módulo
npm run create:use-case <modulo> <nombre>  # Agrega un use case a un módulo existente
npm run create:swagger-docs <modulo>       # Genera docs OpenAPI del módulo
```

## Prisma / Migraciones

- **Multi-file schema**: cada modelo tiene su propio archivo en `prisma/schema/<modelo>.prisma`. La configuración base (generator + datasource) está en `prisma/schema/base.prisma`.
- Crear migración **sin aplicar**: `npx prisma migrate dev --name <nombre> --create-only`
- Las migraciones se verifican en local antes de cualquier deploy.
- Nunca editar una migración ya comiteada — crear una nueva.

## Documentación API

- Docs en `src/docs/paths/<modulo>/` usando `@asteasolutions/zod-to-openapi`.
- Todo endpoint nuevo requiere su definición de path.

## Testing

- Cada módulo debe tener tests (`.spec.ts` o `.test.ts`).
- Ejecutar `npm test` tras cualquier cambio funcional.
- Actualizar tests existentes si los cambios los afectan.

## Excepciones disponibles

Importar desde `src/exceptions/exceptions.ts`:
`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`,
`ConflictException`, `UnprocessableEntityException`, `InternalServerErrorException`, etc.

Los **nombres de clase se mantienen en inglés** (convención HTTP); sus **mensajes van en español** (`throw new NotFoundException("Usuario no encontrado")`).
