# Crear seed de módulo

Crea datos mock realistas para un módulo y los registra en el seed principal. Recibe el nombre del módulo como argumento: $ARGUMENTS

## Pasos a seguir en orden

### 1. Verificar que @faker-js/faker está instalado

```bash
cat package.json | grep faker
```

Si no está instalado, instalarlo como dependencia de desarrollo:

```bash
npm install --save-dev @faker-js/faker
```

### 2. Leer el modelo Prisma del módulo

Leer `prisma/schema/$ARGUMENTS.prisma` para entender:
- Campos requeridos y opcionales
- Tipos de datos (String, Int, Boolean, DateTime, etc.)
- Restricciones (unique, default, etc.)
- Relaciones con otros modelos

### 3. Leer el schema Zod del módulo

Leer `src/modules/$ARGUMENTS/schemas/$ARGUMENTS.schema.ts` para entender validaciones adicionales (longitudes mínimas, formatos, etc.).

### 4. Crear el archivo de seed del módulo

Ruta: `src/seeds/$ARGUMENTS.seed.ts`

**Plantilla base:**

```typescript
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

faker.setLocale("es");

export const seed$ARGUMENTS_PASCALCASE = async (prisma: PrismaClient): Promise<void> => {
    const items = Array.from({ length: 10 }, () => ({
        // mapear los campos del modelo con datos faker realistas
    }));

    await prisma.$ARGUMENTS.createMany({ data: items, skipDuplicates: true });
    console.log(`✅ Seed de $ARGUMENTS: ${items.length} registros creados`);
};
```

Reglas para los datos mock:
- Usar `faker.setLocale("es")` para datos en español
- Usar el generador de faker más apropiado para cada campo:
  - Nombres → `faker.person.firstName()`, `faker.person.lastName()`
  - Emails → `faker.internet.email()`
  - Textos cortos → `faker.lorem.words(3)`
  - Textos largos → `faker.lorem.paragraph()`
  - Números → `faker.number.int({ min, max })`
  - Fechas → `faker.date.past()`
  - Booleanos → `faker.datatype.boolean()`
  - UUIDs → `faker.string.uuid()`
  - Precios → `faker.commerce.price()`
  - Teléfonos → `faker.phone.number()`
- Si el módulo tiene `password`, hashearlo con argon2:
  ```typescript
  import * as argon2 from "argon2";
  password: await argon2.hash("Password123!", { type: argon2.argon2id })
  ```
- Si hay campos `unique` (como `email`), asegurarse de que faker genere valores únicos o usar `skipDuplicates: true`
- No incluir `created_at`, `updated_at`, `deleted_at` — Prisma los maneja automáticamente

### 5. Registrar en el seed principal

Abrir `src/seeds/seed.ts` y agregar el import y la llamada dentro de `runSeeds()`:

```typescript
import { seed$ARGUMENTS_PASCALCASE } from "./$ARGUMENTS.seed";

// dentro de runSeeds():
await seed$ARGUMENTS_PASCALCASE(prisma);
logger.info("Seed de $ARGUMENTS ejecutado");
```

### 6. Verificar que compila

```bash
npm run build
```

### 7. Confirmar al usuario

Mostrar:
- Archivo creado: `src/seeds/$ARGUMENTS.seed.ts`
- Cantidad de registros que se van a insertar
- Recordar que puede ejecutar el seed con: `npx ts-node src/seeds/seed.ts`
- Advertir que `npm run seed` hace DROP + migrate antes de seedear — solo usarlo en entornos locales limpios
