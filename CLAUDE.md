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
- **Testing**: Jest + ts-jest
- **Logger**: `LoggerService` importado de `common/utils/logger.util`

## Estructura de un módulo

Cada módulo vive en `src/modules/<nombre-modulo>/` y sigue este layout:

```
<nombre-modulo>/
  schemas/          # Zod schemas + DTOs exportados
  use-cases/        # Un archivo por caso de uso: <accion>-<modulo>.use-case.ts
  <modulo>.controller.ts
  <modulo>.router.ts
```

No hay clases Repository — los use cases usan `prisma` directamente.

## Convenciones de código

- **Programación funcional**: sin clases en use cases ni controllers (solo funciones arrow/regulares).
- **Un use case por archivo** con nombre en kebab-case + sufijo `.use-case.ts`. La función exportada en camelCase.
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
