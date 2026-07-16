# base-node-express-ts

Base de proyecto Node.js + TypeScript + Express con Prisma, autenticación JWT y documentación OpenAPI auto-generada.

## Stack

- **Runtime**: Node.js v20+, TypeScript, Express
- **ORM**: Prisma (PostgreSQL)
- **Autenticación**: JWT con [jose](https://github.com/panva/jose), passwords con argon2id
- **Validación**: Zod + `@asteasolutions/zod-to-openapi`
- **Documentación**: Swagger UI (`/docs`)
- **Testing**: Vitest
- **Logger**: Winston

---

## Requisitos previos

- Node.js v20 o superior
- Docker y Docker Compose
- pnpm

---

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd base-node-express-ts
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Variables de entorno

Crear un archivo `.env` basado en `.env.example`. Variables mínimas requeridas:

```env
PORT=3000
API_URL=http://localhost:3000/api

DATABASE_URL=postgresql://postgres:postgres@localhost:5433/mydb

JWT_SECRET=supersecreto
```

### 4. Levantar la base de datos

```bash
docker-compose up -d
```

Servicios disponibles:

| Servicio     | URL                        | Credenciales               |
|--------------|----------------------------|----------------------------|
| PostgreSQL   | `localhost:5433`           | user: `postgres` / pass: `postgres` |
| CloudBeaver  | http://localhost:8978      | Setup wizard al primer acceso |

> Para conectarte desde CloudBeaver usá host `postgres` (nombre del servicio Docker), puerto `5432`.

### 5. Ejecutar migraciones

```bash
pnpm prisma migrate dev
```

### 6. Poblar la base de datos (opcional)

```bash
pnpm exec tsx src/seeds/seed.ts
```

> `pnpm run seed` hace DROP + migrate + seed. Usar solo en entornos locales limpios.

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm run dev` | Servidor en modo desarrollo con hot-reload |
| `pnpm run start` | Compila y ejecuta en producción |
| `pnpm run build` | Compila TypeScript |
| `pnpm run lint` | Ejecuta ESLint |
| `pnpm run lint:fix` | Corrige errores de lint automáticamente |
| `pnpm run format` | Formatea el código con Prettier |
| `pnpm run test` | Ejecuta los tests |
| `pnpm run test:coverage` | Tests con reporte de cobertura |
| `pnpm run studio` | Abre Prisma Studio en el navegador |
| `pnpm run create:module <nombre>` | Genera la estructura completa de un módulo |
| `pnpm run create:use-case <modulo> <nombre>` | Agrega un caso de uso a un módulo |
| `pnpm run create:swagger-docs <modulo>` | Genera documentación OpenAPI para un módulo |

---

## Estructura del proyecto

```
src/
├── common/
│   ├── enums/          # Enums globales (no usar enum en Prisma, solo String)
│   ├── middlewares/    # Middlewares compartidos (authUser, etc.)
│   └── utils/          # Utilidades globales (logger, jwt, s3, etc.)
├── config/             # Configuraciones (env, prisma, server)
├── docs/
│   └── paths/          # Definiciones OpenAPI por módulo
├── exceptions/         # Clases de excepción HTTP
├── modules/            # Módulos de la aplicación
├── seeds/              # Scripts de datos mock
└── app.ts              # Punto de entrada
```

### Estructura de un módulo

```
src/modules/<nombre>/
├── schemas/
│   └── <nombre>.schema.ts      # Schemas Zod + DTOs
├── use-cases/
│   ├── create-<nombre>.use-case.ts
│   ├── get-all-<nombre>.use-case.ts
│   ├── get-one-<nombre>.use-case.ts
│   ├── update-<nombre>.use-case.ts
│   └── delete-<nombre>.use-case.ts
├── <nombre>.controller.ts
└── <nombre>.router.ts
```

---

## Prisma

### Schema multi-archivo

Cada modelo tiene su propio archivo en `prisma/schema/<modelo>.prisma`. La configuración base está en `prisma/schema/base.prisma`.

Convenciones obligatorias:
- Nombre del modelo: `snake_case` (e.g. `user_profile`)
- Campos: `snake_case` directamente (sin `@map` en campos individuales)
- Tabla (`@@map`): `snake_case` en plural

```prisma
model user {
  id         String    @id @default(uuid())
  first_name String
  email      String    @unique
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@map("users")
}
```

### Migraciones

```bash
# Crear migración sin aplicar (para revisarla antes)
pnpm prisma migrate dev --name <nombre-descriptivo> --create-only

# Aplicar migraciones pendientes
pnpm prisma migrate dev

# Ver el schema en el navegador
pnpm run studio
```

> Nunca editar una migración ya comiteada. Crear una nueva en su lugar.

---

## Autenticación

- **JWT**: generado y verificado con `jose` (HS256)
- **Passwords**: hasheadas con argon2id via `argon2`
- **Middleware**: `authUser` en `src/common/middlewares/authUser.middleware.ts`

Endpoints disponibles en `/api/v1/auth`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login, retorna JWT |
| POST | `/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/auth/reset-password` | Resetear contraseña con token |

---

## Documentación API

Swagger UI disponible en `http://localhost:<PORT>/docs` al iniciar el servidor.

Los logs del servidor muestran las URLs al arrancar:

```
[Server] Server running at http://localhost:3000
[Server] API       → http://localhost:3000/api/v1
[Server] Docs      → http://localhost:3000/docs
```

---

## Seeds

```bash
# Ejecutar solo los seeds (requiere BD con migraciones aplicadas)
pnpm exec tsx src/seeds/seed.ts

# Crear seed para un módulo nuevo
# (vía Claude Code skill /new-seed <modulo>)
```

Los seeds usan `@faker-js/faker` con locale `fakerES` y passwords hasheadas con argon2id.

---

## Claude Code Skills

El proyecto incluye slash commands para automatizar tareas de desarrollo. Requieren [Claude Code](https://claude.ai/code).

| Skill | Descripción |
|-------|-------------|
| `/new-module <nombre>` | Crea estructura completa de módulo (schema, use cases, controller, router, docs, test) |
| `/delete-module <nombre>` | Elimina un módulo y limpia sus referencias |
| `/new-use-case <modulo> <nombre>` | Agrega un caso de uso a un módulo existente |
| `/new-prisma-model <nombre>` | Crea un archivo `.prisma` para un nuevo modelo |
| `/new-migration <nombre>` | Crea y opcionalmente aplica una migración de Prisma |
| `/new-middleware <nombre>` | Crea un middleware en `src/common/middlewares/` |
| `/new-enum <nombre>` | Crea un enum en `src/common/enums/` |
| `/new-seed <modulo>` | Crea seed con datos mock para un módulo |
| `/update-seed` | Sincroniza todos los seeds con los schemas actuales |
| `/sync-docs` | Revisa y corrige la documentación OpenAPI de todos los módulos |
| `/new-unit-test <modulo>` | Crea test unitario para un módulo |
| `/new-integration-test <modulo>` | Crea test de integración para un módulo |
| `/release` | Lint → build → commit → versión semántica → push → GitHub Release |

---

## Convenciones de código

- **Programación funcional**: sin clases en use cases ni controllers
- **Un use case por archivo** con nombre en kebab-case + sufijo `.use-case.ts`
- **Enums**: definir en `src/common/enums/`, usar `String` en el schema Prisma
- **Excepciones**: importar desde `src/exceptions/exceptions.ts` (`NotFoundException`, `BadRequestException`, etc.)
- **IDs**: siempre UUID strings (`@id @default(uuid())`)
- **Rutas API**: versionadas bajo `/api/v1`
