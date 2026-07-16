# base-node-express-ts

Plantilla base para APIs REST con Node.js + TypeScript + Express, pensada para arrancar proyectos con las piezas que toda API necesita ya resueltas y con la seguridad activada por defecto: autenticación JWT en cookies `httpOnly` con rotación de refresh tokens y detección de reuso, verificación de email, roles (RBAC), recuperación de contraseña por correo, PostgreSQL con migraciones (Prisma), paginación estándar, i18n (es/en), configuración validada al arranque, logging estructurado con `x-request-id`, rate limiting y arquitectura por use cases.

## Stack

| Pieza | Tecnología |
|---|---|
| Framework | Express + TypeScript + pnpm |
| Base de datos | PostgreSQL + Prisma (multi-file schema, migraciones) |
| Autenticación | JWT access + refresh en cookies `httpOnly`, rotación con detección de reuso |
| Passwords | argon2id (tokens de un solo uso: SHA-256) |
| Validación | Zod + `@asteasolutions/zod-to-openapi` (code-first) |
| Logging | pino: JSON estructurado, `x-request-id`, archivos con rotación |
| i18n | Diccionario propio liviano: errores en `es`/`en` según `Accept-Language` (default: `es`) |
| Documentación | Swagger UI en `/docs` (deshabilitado en producción por defecto) |
| Testing | Vitest |
| Contenedores | Dockerfile multi-stage (usuario no-root) + docker-compose para la DB local |

---

## Quickstart

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
# Generar secretos JWT reales (uno para ACCESS y otro distinto para REFRESH):
#   openssl rand -hex 32

# 3. Base de datos local
docker compose up -d

# 4. Migraciones
pnpm prisma migrate dev

# 5. Datos de prueba (crea admin@example.com / Password123!)
pnpm run seed

# 6. Arrancar en modo desarrollo
pnpm run dev
```

Al arrancar, el log muestra las URLs:

```
[Server] Server running at http://localhost:3000
[Server] API       → http://localhost:3000/api/v1
[Server] Docs      → http://localhost:3000/docs
[Server] Health    → http://localhost:3000/health
```

El health check (`GET /health`, con ping a la DB) queda fuera del prefijo de la API, para los probes de infraestructura.

Servicios del docker-compose local:

| Servicio | URL | Credenciales |
|---|---|---|
| PostgreSQL | `localhost:5433` | user: `postgres` / pass: `postgres` |
| CloudBeaver | http://localhost:8978 | Setup wizard al primer acceso |

---

## Variables de entorno

Validadas con **Zod** al arranque ([env.config.ts](src/config/env.config.ts)): si falta una obligatoria o hay un valor inválido, la app **no arranca** (fail-fast listando todos los errores). El schema es la única fuente de verdad: coerción de tipos (`PORT` llega como number), defaults condicionados a `NODE_ENV` y reglas cruzadas (los secretos JWT deben ser distintos).

| Variable | Descripción | Default |
|---|---|---|
| `NODE_ENV` | `local` \| `dev` \| `qa` \| `prod` | `local` |
| `PORT` | Puerto HTTP | `3000` |
| `DATABASE_URL` | Conexión a PostgreSQL | requerida |
| `API_URL` | URL base pública de la API | requerida |
| `JWT_ACCESS_SECRET` | Secreto del access token (mín. 32 chars) | requerida |
| `JWT_ACCESS_EXPIRES` | TTL del access token | `15m` |
| `JWT_REFRESH_SECRET` | Secreto del refresh token (mín. 32 chars, distinto del access) | requerida |
| `JWT_REFRESH_EXPIRES_DAYS` | TTL del refresh token (días) | `7` |
| `COOKIE_SECURE` | Flag `Secure` de las cookies de auth (solo HTTPS) | `true` en prod, `false` resto |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma. `*` permite todos (solo local) | `*` |
| `BODY_LIMIT` | Tamaño máximo del body JSON | `100kb` |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_SECURE` / `MAIL_USER` / `MAIL_PASSWORD` | SMTP. Sin `MAIL_HOST`, los correos se loguean en vez de enviarse | opcionales |
| `MAIL_FROM` | Remitente de los correos | `no-reply@example.com` |
| `FRONTEND_URL` | Base del frontend para los enlaces de verificación / recuperación | `http://localhost:5173` |
| `PASSWORD_RESET_TTL_MINUTES` | Vigencia del token de recuperación (minutos) | `60` |
| `EMAIL_VERIFICATION_TTL_MINUTES` | Vigencia del token de verificación (minutos) | `1440` |
| `SWAGGER_ENABLED` | Habilita `/docs` | `true` salvo en prod |
| `LOG_LEVEL` | Nivel de log de pino | `info` |

---

## Autenticación

Flujo JWT con **access token** (corto, 15 min) y **refresh token** (largo, 7 días) firmados con **secretos distintos**. Los tokens se entregan en **cookies `httpOnly`** (`access_token` y `refresh_token`), **nunca en el body**: si viajaran en la respuesta, un XSS podría llamar a `/refresh` (la cookie viaja sola) y leer tokens frescos, anulando el beneficio de `httpOnly`.

Endpoints en `/api/v1/auth`:

| Endpoint | Qué hace |
|---|---|
| `POST /auth/register` | Crea el usuario (password con **argon2id**) y envía el correo de verificación. **No inicia sesión** |
| `POST /auth/verify-email` | Verifica el correo con el token recibido; habilita el login |
| `POST /auth/resend-verification` | Reenvía el correo de verificación; invalida el enlace anterior. **204 siempre** |
| `POST /auth/login` | Setea las cookies. Mismo 401 exista o no el email (evita enumeración); **403 si el correo no está verificado** |
| `POST /auth/refresh` | Lee el refresh de su cookie, **rota el par** y setea las nuevas cookies |
| `POST /auth/logout` | Revoca el refresh token y limpia las cookies |
| `POST /auth/forgot-password` | Envía por correo un enlace con token para recuperar la contraseña. **204 siempre** |
| `POST /auth/reset-password` | Restablece la contraseña con el token recibido y revoca todas las sesiones |

**Rotación con detección de reuso**: cada refresh invalida el token anterior. Si se presenta un refresh ya rotado (firma válida pero hash distinto al guardado), se asume robo y **se revoca la sesión completa** — el refresh vigente también deja de servir.

De los tokens de larga vida (refresh, verificación, reset) solo se guarda su **hash SHA-256** en la DB, nunca el token en claro.

### Propiedades de las cookies ([cookie.util.ts](src/common/utils/cookie.util.ts))

- `httpOnly` — el JS del navegador no puede leerlas (mitiga robo por XSS).
- `SameSite=Lax` — no viajan en peticiones cross-site (mitiga CSRF).
- `Secure` — solo HTTPS; activo en producción por defecto (`COOKIE_SECURE`).
- La cookie de refresh tiene `Path=/api/v1/auth/refresh`: el token de larga vida solo viaja al único endpoint que lo necesita.
- El `maxAge` de cada cookie se deriva del TTL del JWT correspondiente.

### Consumir la API

- **Navegadores / SPAs**: hacer las peticiones con `credentials: 'include'` (CORS ya responde con `Access-Control-Allow-Credentials`). No hay que manejar tokens a mano.
- **Clientes API / móviles**: `authUser` también acepta `Authorization: Bearer <token>` como fallback, y `/refresh` acepta el refresh en el body (`refresh_token`).

### Política de contraseñas

Definida en [strong-password.schema.ts](src/common/schemas/strong-password.schema.ts), usada en registro, creación de usuarios y reset: entre **8 y 128 caracteres** y al menos **una minúscula, una mayúscula, un número y un carácter especial**. El login no aplica la política (solo tipo y longitud máxima). Los mensajes salen traducidos (es/en).

### Roles (RBAC)

- `user.role` (`admin` | `user`, default `user`) — enum en [role.enum.ts](src/common/enums/role.enum.ts) (en Prisma se usa `String`).
- El rol viaja **dentro del JWT**: sin consulta extra por request. Un cambio de rol aplica al renovar el token o al re-loguear.
- Middlewares: `requireRole(Role.ADMIN)`, `ownerOrAdmin()` (anti-IDOR) y `restrictPrivilegedFields` (anti mass-assignment).
- El seed crea un admin listo para usar: `admin@example.com` / `Password123!`.

---

## Seguridad incluida

- **Tokens en cookies `httpOnly`** con `SameSite=Lax` y `Secure` en producción.
- **Verificación de email obligatoria** antes de poder iniciar sesión.
- **Solo se parsea body JSON** (sin parser `urlencoded`): un `<form>` cross-site llega con body vacío y se rechaza — cierra el login-CSRF. Límite de tamaño de body explícito (`BODY_LIMIT`).
- **helmet** (headers de seguridad) y **CORS** restringido a `CORS_ORIGINS`.
- **Rate limiting** en los endpoints de auth (blanco típico de fuerza bruta).
- **`omit` global de Prisma**: `password` y los hashes de tokens jamás salen en una respuesta.
- **Handler global de excepciones**: formato de error uniforme con `requestId`, sin stack traces al cliente. Mapea errores conocidos de Prisma a HTTP correcto (P2002 unique → 409, P2003 FK → 409, P2025 → 404, P2023 uuid inválido → 400) — p. ej., la carrera de dos registros simultáneos con el mismo email responde 409, no 500.
- **Logs con redacción**: `authorization`, `cookie` y `set-cookie` aparecen como `[Redacted]`.
- **Fail-fast de configuración**: env inválido aborta el boot.
- **Graceful shutdown** y contenedor con usuario no-root.

---

## Paginación estándar

Todo listado usa el mismo patrón, definido en [pagination.schema.ts](src/common/schemas/pagination.schema.ts):

- `PaginationQuerySchema`: `?page=2&limit=20&order=desc` — `limit` con tope 100, valores validados y con defaults.
- `Paginated<T>`: respuesta uniforme `{ items, total, page, limit, pages }`.

```ts
// En el use case:
const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip: skipOf(query), take: query.limit, orderBy: { created_at: query.order } }),
    prisma.user.count({ where }),
]);
return paginate(items, total, query);
```

Ejemplo funcionando: `GET /api/v1/user?page=1&limit=20` (solo admin).

---

## Errores e i18n

Toda respuesta de error sale con el mismo formato (armado en [custom-exceptions.ts](src/exceptions/custom-exceptions.ts)) y el `message` se traduce al idioma que el cliente pida en la cabecera `Accept-Language` (`es` | `en`; sin cabecera o idioma no soportado → español). Variantes regionales como `es-AR` resuelven al idioma base.

```json
{
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "Credenciales inválidas",
    "path": "/api/v1/auth/login",
    "timestamp": "2026-07-16T05:56:18.158Z",
    "requestId": "ed754f3f-f459-4cdd-8765-466b9a3e88bc"
}
```

Cómo funciona:

- Los textos viven en [src/common/i18n/locales/](src/common/i18n/locales/) (`es.locale.ts`, `en.locale.ts`).
- **Excepciones de negocio**: se lanzan con la clave de traducción como mensaje — `throw new UnauthorizedException("errors.INVALID_CREDENTIALS")` — y el handler global la resuelve al idioma del request. Un mensaje que no empieza con `errors.` pasa tal cual.
- El campo `error` (nombre del status HTTP) queda en inglés a propósito: es un identificador para máquinas.
- Para agregar un idioma: crear `locales/<lang>.locale.ts` (tipado con `TranslationDict`) y sumarlo al mapa de `i18n.util.ts`.
- Para un error nuevo: sumar la clave en ambos locales y lanzarla como mensaje de la excepción.

---

## Correos

El envío usa **nodemailer** ([mailer.util.ts](src/common/mail/mailer.util.ts)). Sin `MAIL_HOST` configurado, el correo se escribe en los logs en vez de enviarse — la app arranca sin SMTP en desarrollo.

Los correos se arman con **templates multi-idioma** en [templates/](src/common/mail/templates): cada template es una función que recibe el idioma y sus parámetros y devuelve `{ subject, html, text }`. El idioma sale del request (`Accept-Language`), igual que el resto de la API. Para un correo nuevo: crear su `*.template.ts` reutilizando `layout()` y las claves `mail.*` de los locales.

---

## Logs

Configurados en [logger.util.ts](src/common/utils/logger.util.ts) con `pino.multistream` (varios destinos a la vez):

| Destino | Contenido | Cuándo |
|---|---|---|
| `logs/combined.log` | Todo desde `debug` | siempre (salvo tests) |
| `logs/error.log` | Solo `error` y `fatal` | siempre (salvo tests) |
| Consola legible (pino-pretty) | Según `LOG_LEVEL` | salvo producción |
| Consola JSON | Según `LOG_LEVEL` | producción (para docker/orquestadores) |

Los archivos rotan a diario o al superar 20 MB, los rotados se comprimen con gzip y los más viejos se borran solos (retención: 14 archivos para combined, 30 para error).

Cada petición lleva un `x-request-id` (respetado si viene de un gateway) que aparece en todos sus logs y en las respuestas de error — permite correlacionar un error reportado con su traza exacta.

---

## Tests

```bash
pnpm test        # unit/integración: jwt (secretos separados), middlewares de
                 # autorización, omit global de Prisma
pnpm test:e2e    # e2e con HTTP y DB reales: verificación de email, cookies
                 # httpOnly, rotación + detección de reuso, anti-enumeración,
                 # recuperación de contraseña, RBAC, anti-IDOR, paginación,
                 # formato de errores + i18n, health
```

Los e2e usan su **propia base** (`base_node_express_test`, config en [.env.test](.env.test)): `pnpm test:e2e` la crea y migra solo si hace falta ([setup-e2e-db.ts](test/setup-e2e-db.ts)) y trunca las tablas al inicio de cada corrida — la DB de desarrollo nunca se toca (hay cinturón de seguridad: si el nombre de la DB no contiene `test`, el suite aborta). El único efecto externo mockeado es el envío de correos, del que los tests capturan los tokens de los enlaces.

---

## Docker (producción)

Imagen multi-stage: compila, poda a dependencias de producción y corre como usuario no-root.

```bash
docker build -t base-node-express-ts .
docker run --env-file .env -p 3000:3000 base-node-express-ts
```

Los logs de archivo se escriben en `/app/logs`: montar un volumen ahí si se quiere persistirlos fuera del contenedor.

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm run dev` | Servidor en modo desarrollo con hot-reload |
| `pnpm run start` | Compila y ejecuta en producción |
| `pnpm run build` | Compila TypeScript |
| `pnpm run lint` / `lint:fix` | ESLint |
| `pnpm run format` | Prettier |
| `pnpm run test` / `test:coverage` | Tests con Vitest |
| `pnpm run seed` | **DROP** + migrate + seed (solo entornos locales limpios) |
| `pnpm run studio` | Abre Prisma Studio |
| `pnpm run create:module <nombre>` | Genera la estructura completa de un módulo |
| `pnpm run create:use-case <modulo> <nombre>` | Agrega un caso de uso a un módulo |
| `pnpm run create:swagger-docs <modulo>` | Genera documentación OpenAPI para un módulo |

---

## Estructura del proyecto

```
src/
├── common/
│   ├── enums/          # Enums globales (no usar enum en Prisma, solo String)
│   ├── i18n/           # Diccionarios es/en + resolución de Accept-Language
│   ├── mail/           # Envío de correos + templates multi-idioma
│   ├── middlewares/    # authUser, requireRole, ownership, validateSchema,
│   │                   # rateLimit, requestLogger (x-request-id), language
│   ├── schemas/        # Schemas compartidos (paginación, strong password, ids)
│   └── utils/          # logger (pino), jwt, hash, cookies
├── config/             # env (validado con Zod), prisma, server
├── docs/
│   └── paths/          # Definiciones OpenAPI por módulo
├── exceptions/         # Clases de excepción HTTP + handler global
├── modules/            # Módulos de la aplicación (auth, user, ...)
├── seeds/              # Scripts de datos mock
└── app.ts              # Punto de entrada
```

### Estructura de un módulo

```
src/modules/<nombre>/
├── schemas/
│   └── <nombre>.schema.ts      # Schemas Zod + DTOs
├── use-cases/                  # Un archivo por caso de uso
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

### Migraciones

```bash
# Crear migración sin aplicar (para revisarla antes)
pnpm prisma migrate dev --name <nombre-descriptivo> --create-only

# Aplicar migraciones pendientes
pnpm prisma migrate dev
```

> Nunca editar una migración ya comiteada. Crear una nueva en su lugar.

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
- **Excepciones**: importar desde `src/exceptions/exceptions.ts` y lanzarlas con claves i18n (`errors.XXX`)
- **IDs**: siempre UUID strings (`@id @default(uuid())`)
- **Rutas API**: versionadas bajo `/api/v1`
