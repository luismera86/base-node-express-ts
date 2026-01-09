## Instructivo para poner en marcha el proyecto

### Requisitos previos

- Node.js (versión recomendada: 20 o superior)
- Docker y Docker Compose
- npm

### Configuración del entorno local

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd emooti
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configuración de variables de entorno**

- Crear un archivo `.env` en la raíz del proyecto (puedes basarlo en `.env.example`).
- Asegurarse de configurar las siguientes variables mínimas:
    - DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT
    - JWT_SECRET, SESSION_SECRET
    - PORT, API_URL

4. **Levantar la base de datos**

```bash
docker-compose up -d
```

5. **Ejecutar migraciones**

```bash
npm run migration:run
```

### Ejecutar el proyecto

#### Desarrollo

```bash
npm run dev
```

#### Producción

```bash
npm run start
```

### Scripts disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con recarga (tsnd)
- `npm run start` - Compila y ejecuta la aplicación para producción
- `npm run build` - Compila el proyecto
- `npm run test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código

### Estructura del proyecto

```
src/
├── common/         # Archivos globales para todo el proyecto
├── config/         # Configuraciones
├── docs/           # Documentación
├── exceptions/     # Archivos de excepciones
├── migrations/     # Migraciones de la base de datos
├── modules/        # Módulos que contienen la estructura de cada entidad
├── test/           # Archivos de testing
└── app.ts          # Punto de entrada de la aplicación
```

### Estructura de Módulos

Cada módulo en la aplicación sigue una estructura específica para mantener la organización y separación de responsabilidades. A continuación se muestra la estructura del módulo de usuario como ejemplo:

```
src/modules/user/
├── entities/                     # Definiciones de entidades
│   └── user.entity.ts            # Entidad de usuario con decoradores TypeORM
├── schemas/                      # Esquemas de validación
│   └── user.schema.ts            # Esquemas Zod para validación de datos
├── use-cases/                    # Casos de uso de la aplicación
│   ├── create-user.use-case.ts   # Lógica para crear usuarios
│   ├── get-all-users.use-case.ts # Lógica para obtener todos los usuarios
│   └── get-one-user.use-case.ts  # Lógica para obtener un usuario específico
├── user.controller.ts            # Controlador que maneja las peticiones HTTP
└── user.router.ts                # Definición de rutas del módulo
```

#### Descripción de cada componente:

1. **entities/**
    - Contiene las definiciones de las entidades usando TypeORM
    - Define la estructura de la tabla en la base de datos
    - Incluye decoradores para mapeo objeto-relacional
    - Se puede extender desde dos entidades base que ya incluyen por defecto id, createdAt, updatedAt, deletedAt.
    - BaseEntity con ID tipo Int auto incremental.
    - BaseUUIDEntity con ID tipo UUID string. (Recomendado para usuarios)

2. **schemas/**
    - Contiene los esquemas de validación usando Zod
    - Define la estructura y validaciones de los datos de entrada
    - Asegura la integridad de los datos antes de procesarlos

3. **use-cases/**
    - Implementa la lógica de negocio específica del módulo
    - Cada caso de uso es una función pura independiente
    - Sigue el principio de responsabilidad única
    - Maneja la interacción con la base de datos a través de repositories
    - Utiliza los repositories importados desde `src/common/repositories/repositories.ts`

4. **controller.ts**
    - Contiene funciones controladoras (no clases)
    - Cada función maneja una petición HTTP específica
    - Coordina los casos de uso (funciones)
    - Formatea las respuestas
    - Maneja los errores a nivel de API
    - Las funciones se exportan individualmente para facilitar el testing

5. **router.ts**
    - Exporta una función que crea y retorna un Router de Express
    - Define las rutas del módulo
    - Se conecta con la función `createBaseRouter()` que está en common para designar los path globales
    - Configura los middlewares necesarios
    - Conecta las rutas con las funciones controladoras

Esta estructura modular permite:

- Separación clara de responsabilidades
- Código mantenible y escalable
- Fácil testing de componentes individuales (funciones puras)
- Reutilización de código mediante composición de funciones
- Organización consistente en toda la aplicación
- Menor acoplamiento gracias a la programación funcional

### Documentación de la API

La documentación de la API está disponible en `/docs` cuando el servidor está en ejecución.

### Proceso de Migraciones

Las migraciones son una parte fundamental para mantener la estructura de la base de datos sincronizada con el código. El proyecto utiliza TypeORM para manejar las migraciones.

#### Generar una nueva migración

Para generar una nueva migración después de modificar las entidades:

```bash
npm run migration:generate --name=nombre-de-la-migracion
```

Por ejemplo:

```bash
npm run migration:generate --name=add-user-role
```

#### Ejecutar migraciones pendientes

Para aplicar todas las migraciones pendientes a la base de datos:

```bash
npm run migration:run
```

#### Revertir la última migración

Si necesitas revertir la última migración ejecutada:

```bash
npm run migration:revert
```

#### Estructura de las migraciones

Las migraciones se almacenan en `src/migrations/` y siguen este formato:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeLaMigracion1234567890123 implements MigrationInterface {
    name = "NombreDeLaMigracion1234567890123";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Código para aplicar los cambios
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), ...)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Código para revertir los cambios
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
```

#### Buenas prácticas para migraciones

1. **Nombres descriptivos**
    - Usar nombres que describan claramente el propósito de la migración
    - Ejemplo: `add-user-role`, `create-posts-table`

2. **Métodos up y down**
    - El método `up` debe implementar los cambios
    - El método `down` debe revertir los cambios
    - Asegurarse de que `down` revierta exactamente lo que hace `up`

3. **Orden de ejecución**
    - Las migraciones se ejecutan en orden cronológico
    - Nunca modificar una migración ya ejecutada
    - Crear una nueva migración para cambios adicionales

4. **Validación**
    - Probar las migraciones en un entorno de desarrollo antes de aplicarlas en producción
    - Verificar que el método `down` funcione correctamente

5. **Backup**
    - Realizar backup de la base de datos antes de ejecutar migraciones en producción
    - Tener un plan de rollback en caso de problemas

#### Comandos adicionales de TypeORM

Para ver el estado de las migraciones:

```bash
npx typeorm migration:show
```

Para crear una migración vacía:

```bash
npx typeorm migration:create src/migrations/NombreDeLaMigracion
```

### Creación de Módulos

El proyecto incluye un script automatizado para crear nuevos módulos siguiendo la estructura estándar. Este script genera todos los archivos necesarios con la configuración básica.

#### Crear un nuevo módulo

Para crear un nuevo módulo, simplemente ejecuta:

```bash
npm run create:module nombre-del-modulo
```

Por ejemplo, para crear un módulo de productos:

```bash
npm run create:module product
```

El script creará automáticamente:

- La estructura de carpetas necesaria
- La entidad con campos básicos
- Los esquemas de validación
- Los casos de uso (CRUD completo)
- El controlador con métodos arrow functions
- El router con todas las rutas configuradas

#### Estructura generada

El script generará la siguiente estructura:

```
src/modules/nombre-del-modulo/
├── entities/
│   └── nombre-del-modulo.entity.ts
├── schemas/
│   └── nombre-del-modulo.schema.ts
├── use-cases/
│   ├── create-nombre-del-modulo.use-case.ts
│   ├── get-all-nombre-del-modulo.use-case.ts
│   ├── get-one-nombre-del-modulo.use-case.ts
│   ├── update-nombre-del-modulo.use-case.ts
│   └── delete-nombre-del-modulo.use-case.ts
├── nombre-del-modulo.controller.ts
└── nombre-del-modulo.router.ts
```

#### Después de crear el módulo

Una vez creado el módulo, necesitas:

1. Registrar el módulo en tu aplicación
2. Ejecutar las migraciones si has modificado la entidad
3. Personalizar los campos y validaciones según tus necesidades

### Repositorios unificados 

Desde la versión actual el proyecto mantiene un archivo unificado de repositories en:

```
src/common/repositories/repositories.ts
```

Qué contiene
- Importaciones de las entidades (todas agrupadas al inicio del archivo).
- Exportaciones de variables `const` que exponen el repository de TypeORM para cada entidad, por ejemplo:

```ts
import AppDataSource from "../../config/datasource.config";
import { Test } from "../../modules/test/entities/test.entity";

export const testRepository = AppDataSource.getRepository(Test);

export const test2Repository = AppDataSource.getRepository(Test2);
```

Por qué existe
- Evita generar un archivo de repositorio por cada módulo (menos archivos sueltos).
- Facilita reusar los repositories en los casos de uso importando una única fuente.

Cómo se actualiza
- El script `npm run create:module <name>` añade automáticamente la importación de la entidad y la exportación del repository en `src/common/repositories/repositories.ts`.
- Las importaciones siempre se agrupan arriba; las exportaciones se agregan debajo, separadas por una línea en blanco.

Cómo usarlo en los use-cases
- En los casos de uso generados (que son funciones puras), se importa la variable del repository correspondiente, por ejemplo para el módulo `test`:

```ts
import { testRepository } from "../../../common/repositories/repositories";
import { LoggerService } from "../../../common/utils/logger.util";

const logger = new LoggerService("GetAllTestUseCase");

export const getAllTests = async (): Promise<Test[]> => {
    try {
        const tests = await testRepository.find();
        return tests;
    } catch (error: unknown) {
        logger.error("Error getting all tests", (error as Error).message);
        throw error;
    }
};
```

- Para operaciones de creación y actualización con transacciones:

```ts
import { testRepository } from "../../../common/repositories/repositories";
import AppDataSource from "../../../config/datasource.config";

export const createTest = async (data: CreateTestDto): Promise<Test> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const existingTest = await testRepository.findOne({ where: { name: data.name } });
        if (existingTest) throw new BadRequestException("Test already exists");

        const createdTest = testRepository.create(data);
        await testRepository.save(createdTest);
        await queryRunner.commitTransaction();
        return createdTest;
    } catch (error: unknown) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
```

Notas y buenas prácticas
- Si necesitas un comportamiento transaccional usa explícitamente `createQueryRunner()` en el caso de uso (solo cuando sea necesario).
- Mantén las entidades exportadas con nombres coherentes para que el script pueda añadir correctamente las importaciones.
- Si migras repositorios individuales antiguos a este archivo, asegúrate de eliminar los archivos anteriores para evitar duplicados.

### Creación de Casos de Uso

El proyecto incluye un script automatizado para crear nuevos casos de uso dentro de un módulo existente. Este script genera el archivo del caso de uso con la estructura básica necesaria siguiendo el paradigma de programación funcional.

#### Crear un nuevo caso de uso

Para crear un nuevo caso de uso, ejecuta:

```bash
npm run create:use-case nombre-del-modulo nombre-del-caso-uso
```

Por ejemplo, para crear un caso de uso de "crear producto" en el módulo de productos:

```bash
npm run create:use-case product create-product
```

El script generará un nuevo archivo en la ruta `src/modules/product/use-cases/create-product.use-case.ts` con la estructura básica necesaria, incluyendo:

- Importaciones necesarias (repository, logger, tipos)
- Función pura exportada con el nombre en camelCase
- Configuración básica del QueryRunner (cuando sea necesario)
- Estructura try-catch para manejo de transacciones
- Logger configurado
- Uso del repository del módulo correspondiente

### Creación de Documentación de Swagger

El proyecto incluye un script automatizado para generar la documentación de Swagger para módulos existentes. Este script crea todos los archivos de paths necesarios y actualiza automáticamente el archivo principal de Swagger.

#### Crear documentación para un módulo existente

Para crear la documentación de Swagger para un módulo que ya existe, ejecuta:

```bash
npm run create:swagger-docs nombre-del-modulo
```

Por ejemplo, para crear la documentación del módulo de productos:

```bash
npm run create:swagger-docs product
```

#### Requisitos previos

Antes de crear la documentación, asegúrate de que:

1. **El módulo existe**: El módulo debe haber sido creado previamente con `npm run create:module`
2. **El schema existe**: El archivo de schema debe existir en `src/modules/nombre-modulo/schemas/`
3. **Los casos de uso están implementados**: Los casos de uso básicos deben estar creados

#### Estructura generada

El script creará automáticamente:

```
src/docs/paths/nombre-del-modulo/
├── nombre-del-modulo.paths.ts      # Archivo principal que registra todos los paths
├── create.path.ts                  # Endpoint POST para crear
├── get-all.path.ts                 # Endpoint GET para obtener todos
├── get-by-id.path.ts               # Endpoint GET para obtener por ID
├── update.path.ts                  # Endpoint PUT para actualizar
└── delete.path.ts                  # Endpoint DELETE para eliminar
```

#### Archivos generados

1. **nombre-del-modulo.paths.ts**
    - Clase principal que extiende `BasePath`
    - Registra todos los paths del módulo
    - Importa y ejecuta cada path individual

2. **create.path.ts**
    - Endpoint POST para crear nuevos registros
    - Incluye validación del schema
    - Respuestas para 201, 400, 401

3. **get-all.path.ts**
    - Endpoint GET para obtener todos los registros
    - Retorna array de objetos
    - Respuestas para 200, 401

4. **get-by-id.path.ts**
    - Endpoint GET para obtener un registro por ID
    - Parámetro de ruta `{id}`
    - Respuestas para 200, 404, 401

5. **update.path.ts**
    - Endpoint PUT para actualizar registros
    - Parámetro de ruta `{id}` y body
    - Respuestas para 200, 400, 404, 401

6. **delete.path.ts**
    - Endpoint DELETE para eliminar registros
    - Parámetro de ruta `{id}`
    - Respuestas para 200, 404, 401

#### Actualización automática del archivo swagger.ts

El script también actualiza automáticamente el archivo `src/docs/swagger.ts` con:

- Import del schema del módulo
- Import de la clase de paths
- Registro del schema en el registry
- Registro de los paths

#### Personalización

Después de generar la documentación, puedes personalizar:

- **Descripciones**: Modificar los textos de `summary` y `description`
- **Respuestas**: Agregar códigos de respuesta adicionales
- **Parámetros**: Agregar parámetros de query, headers, etc.
- **Tags**: Cambiar el tag del módulo
- **Schemas**: Referenciar schemas específicos para cada operación

#### Flujo completo de creación de módulos

Para crear un módulo completo con documentación:

1. **Crear el módulo:**

    ```bash
    npm run create:module nombre-modulo
    ```

2. **Crear casos de uso adicionales (opcional):**

    ```bash
    npm run create:use-case nombre-modulo nombre-caso-uso
    ```

3. **Crear documentación de Swagger:**

    ```bash
    npm run create:swagger-docs nombre-modulo
    ```

4. **Personalizar según necesidades:**
    - Modificar entidades y schemas
    - Ajustar casos de uso
    - Personalizar documentación

#### Verificar la documentación

Una vez creada la documentación, puedes verificar que funcione correctamente:

1. **Iniciar el servidor:**

    ```bash
    npm run start:dev
    ```

2. **Acceder a la documentación:**
    - Abrir `http://localhost:3000/docs` en tu navegador
    - Verificar que aparezca tu nuevo módulo en la lista
    - Probar los endpoints desde la interfaz de Swagger

#### Estructura de paths generados

Los paths generados siguen la estructura estándar de OpenAPI 3.0:

```typescript
{
  tags: ["nombre-modulo"],
  method: "get|post|put|delete",
  path: "/nombre-modulo[/{id}]",
  summary: "Descripción de la operación",
  parameters: [...], // Para endpoints con parámetros de ruta
  request: {         // Para endpoints con body
    body: {
      content: {
        "application/json": { schema: SchemaName }
      }
    }
  },
  responses: {
    200: { ... },
    201: { ... },
    400: { ... },
    401: { ... },
    404: { ... }
  }
}
```
