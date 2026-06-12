#!/usr/bin/env bash

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para convertir camelCase a kebab-case
camel_to_kebab() {
    echo "$1" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]'
}

# Función para convertir kebab-case a PascalCase
kebab_to_pascal() {
    # Primero convertimos todo a minúsculas
    local input=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    # Dividimos por guiones y convertimos cada palabra
    local result=""
    IFS='-' read -ra words <<< "$input"
    for word in "${words[@]}"; do
        # Convertimos la primera letra a mayúscula
        first_char=$(echo "${word:0:1}" | tr '[:lower:]' '[:upper:]')
        rest_chars="${word:1}"
        result="${result}${first_char}${rest_chars}"
    done
    echo "$result"
}

# Función para convertir kebab-case a camelCase
kebab_to_camel() {
    echo "$1" | awk '{
        for(i=1; i<=NF; i++) {
            if(i==1) {
                printf("%s", tolower($i))
            } else {
                printf("%s", toupper(substr($i,1,1)) tolower(substr($i,2)))
            }
        }
    }' FS=-
}

# Función para mostrar mensajes de error
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar mensajes de éxito
success() {
    echo -e "${GREEN}$1${NC}"
}

# Función para mostrar mensajes de advertencia
warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Verificar si se proporcionó un nombre de módulo
if [ -z "$1" ]; then
    error "Por favor, proporciona un nombre para el módulo"
    echo "Uso: npm run create:module nombre-modulo"
    exit 1
fi

# Convertir el nombre del módulo a kebab-case si está en camelCase
MODULE_NAME=$(camel_to_kebab "$1")
# Convertir a PascalCase para el nombre de la clase
CLASS_NAME=$(kebab_to_pascal "$MODULE_NAME")
# Convertir a camelCase para variables
MODULE_CAMEL=$(kebab_to_camel "$MODULE_NAME")

# Mostrar los nombres generados para depuración
echo "Entrada: $1"
echo "Nombre del módulo: $MODULE_NAME"
echo "Nombre de la clase: $CLASS_NAME"
echo "Nombre camelCase: $MODULE_CAMEL"

# Verificar si el módulo ya existe
if [ -d "src/modules/$MODULE_NAME" ]; then
    error "El módulo '$MODULE_NAME' ya existe"
fi

# Verificar si el directorio src/modules existe
if [ ! -d "src/modules" ]; then
    error "El directorio 'src/modules' no existe. Asegúrate de estar en la raíz del proyecto."
fi

# Crear la estructura de directorios
mkdir -p "src/modules/$MODULE_NAME/use-cases" || error "No se pudo crear el directorio use-cases"
mkdir -p "src/modules/$MODULE_NAME/schemas" || error "No se pudo crear el directorio schemas"

# Prisma no necesita entidades ni repositorios separados
# Los modelos se definen en prisma/schema/<modelo>.prisma
# Recuerda agregar el modelo ${CLASS_NAME} en prisma/schema/

warning "Recuerda agregar el modelo ${CLASS_NAME} en prisma/schema/"

# Crear el archivo de esquema
cat > "src/modules/$MODULE_NAME/schemas/$MODULE_NAME.schema.ts" << EOF
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const Crear${CLASS_NAME}Schema = {
    body: z.object({
        nombre: z.string().openapi({ example: "Nombre de ejemplo", description: "Nombre de ${MODULE_NAME}" }),
    }).openapi("${CLASS_NAME}")
};

export const Actualizar${CLASS_NAME}Schema = {
    params: z.object({
      id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "id de ${CLASS_NAME}" })),
    }),
    body: Crear${CLASS_NAME}Schema.body.partial(),
};

export const ${CLASS_NAME}Schema = Crear${CLASS_NAME}Schema.body.extend({
    id: z.number(),
});

export const Eliminar${CLASS_NAME}Schema = {
    params: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "id de ${CLASS_NAME}" })),
};

export const Obtener${CLASS_NAME}Schema = {
    params: z.object({
        id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "id de ${CLASS_NAME}" })),
    }),
};

export type Crear${CLASS_NAME}Dto = z.infer<typeof Crear${CLASS_NAME}Schema.body>;
export type Actualizar${CLASS_NAME}Dto = z.infer<typeof Actualizar${CLASS_NAME}Schema.body>;
export type ${CLASS_NAME}Schema = z.infer<typeof ${CLASS_NAME}Schema>;
EOF

# Crear los archivos de casos de uso
cat > "src/modules/$MODULE_NAME/use-cases/crear-$MODULE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { BadRequestException } from "../../../exceptions/exceptions";
import { Crear${CLASS_NAME}Dto } from "../schemas/$MODULE_NAME.schema";

const logger = new LoggerService("Crear${CLASS_NAME}UseCase");

export const crear${CLASS_NAME} = async (datos: Crear${CLASS_NAME}Dto): Promise<any> => {
    try {
        const ${MODULE_CAMEL}Existente = await prisma.${MODULE_CAMEL}.findFirst({ where: { nombre: datos.nombre } });
        if (${MODULE_CAMEL}Existente) throw new BadRequestException("${CLASS_NAME} ya existe");

        const ${MODULE_CAMEL}Creado = await prisma.${MODULE_CAMEL}.create({ data: datos });
        return ${MODULE_CAMEL}Creado;
    } catch (error: unknown) {
        logger.error("Error al crear ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/obtener-todos-$MODULE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("ObtenerTodos${CLASS_NAME}UseCase");

export const obtenerTodos${CLASS_NAME} = async (): Promise<any[]> => {
    try {
        const ${MODULE_CAMEL}s = await prisma.${MODULE_CAMEL}.findMany();
        return ${MODULE_CAMEL}s;
    } catch (error: unknown) {
        logger.error("Error al obtener todos los ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/obtener-$MODULE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("Obtener${CLASS_NAME}UseCase");

export const obtener${CLASS_NAME} = async (id: number): Promise<any> => {
    try {
        const ${MODULE_CAMEL} = await prisma.${MODULE_CAMEL}.findFirst({ where: { id } });
        if (!${MODULE_CAMEL}) throw new NotFoundException("${CLASS_NAME} no encontrado");
        return ${MODULE_CAMEL};
    } catch (error: unknown) {
        logger.error("Error al obtener ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

# Con Prisma no necesitamos archivos de repositorio

cat > "src/modules/$MODULE_NAME/use-cases/actualizar-$MODULE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { Actualizar${CLASS_NAME}Dto } from "../schemas/$MODULE_NAME.schema";

const logger = new LoggerService("Actualizar${CLASS_NAME}UseCase");

export const actualizar${CLASS_NAME} = async (id: number, datos: Actualizar${CLASS_NAME}Dto): Promise<any> => {
    try {
        const ${MODULE_CAMEL}Existente = await prisma.${MODULE_CAMEL}.findFirst({ where: { id } });
        if (!${MODULE_CAMEL}Existente) throw new NotFoundException("${CLASS_NAME} no encontrado");

        const ${MODULE_CAMEL}Actualizado = await prisma.${MODULE_CAMEL}.update({
            where: { id },
            data: datos
        });
        return ${MODULE_CAMEL}Actualizado;
    } catch (error: unknown) {
        logger.error("Error al actualizar ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/eliminar-$MODULE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("Eliminar${CLASS_NAME}UseCase");

export const eliminar${CLASS_NAME} = async (id: number): Promise<void> => {
    try {
        const ${MODULE_CAMEL} = await prisma.${MODULE_CAMEL}.findFirst({ where: { id } });
        if (!${MODULE_CAMEL}) throw new NotFoundException("${CLASS_NAME} no encontrado");

        await prisma.${MODULE_CAMEL}.delete({ where: { id } });
    } catch (error: unknown) {
        logger.error("Error al eliminar ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

# Crear el archivo del controlador
cat > "src/modules/$MODULE_NAME/$MODULE_NAME.controller.ts" << EOF
import { Request, Response, NextFunction } from "express";
import { obtenerTodos${CLASS_NAME} } from "./use-cases/obtener-todos-$MODULE_NAME.use-case";
import { obtener${CLASS_NAME} } from "./use-cases/obtener-$MODULE_NAME.use-case";
import { crear${CLASS_NAME} } from "./use-cases/crear-$MODULE_NAME.use-case";
import { actualizar${CLASS_NAME} } from "./use-cases/actualizar-$MODULE_NAME.use-case";
import { eliminar${CLASS_NAME} } from "./use-cases/eliminar-$MODULE_NAME.use-case";
import { Actualizar${CLASS_NAME}Dto } from "./schemas/$MODULE_NAME.schema";

export const obtenerTodos${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ${MODULE_CAMEL}s = await obtenerTodos${CLASS_NAME}();
        res.json(${MODULE_CAMEL}s);
    } catch (error) {
        next(error);
    }
};

export const obtener${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const ${MODULE_CAMEL} = await obtener${CLASS_NAME}(+id);
        res.status(200).json(${MODULE_CAMEL});
    } catch (error) {
        next(error);
    }
};

export const crear${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ${MODULE_CAMEL} = await crear${CLASS_NAME}(req.body);
        res.status(201).json(${MODULE_CAMEL});
    } catch (error) {
        next(error);
    }
};

export const actualizar${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const ${MODULE_CAMEL} = await actualizar${CLASS_NAME}(+id, req.body as Actualizar${CLASS_NAME}Dto);
        res.status(200).json(${MODULE_CAMEL});
    } catch (error) {
        next(error);
    }
};

export const eliminar${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await eliminar${CLASS_NAME}(+id);
        res.status(200).json({ status: "ok", message: "${CLASS_NAME} eliminado correctamente" });
    } catch (error) {
        next(error);
    }
};
EOF

# Crear el archivo del router
cat > "src/modules/$MODULE_NAME/$MODULE_NAME.router.ts" << EOF
import { Router } from "express";
import {
    obtenerTodos${CLASS_NAME}Controller,
    obtener${CLASS_NAME}Controller,
    crear${CLASS_NAME}Controller,
    actualizar${CLASS_NAME}Controller,
    eliminar${CLASS_NAME}Controller
} from "./$MODULE_NAME.controller";

export const ${MODULE_CAMEL}Router = Router();

${MODULE_CAMEL}Router.get("/", obtenerTodos${CLASS_NAME}Controller);
${MODULE_CAMEL}Router.get("/:id", obtener${CLASS_NAME}Controller);
${MODULE_CAMEL}Router.post("/", crear${CLASS_NAME}Controller);
${MODULE_CAMEL}Router.patch("/:id", actualizar${CLASS_NAME}Controller);
${MODULE_CAMEL}Router.delete("/:id", eliminar${CLASS_NAME}Controller);
EOF

success "Módulo '$MODULE_NAME' creado exitosamente!"

# Insertar la nueva ruta en router.ts
ROUTER_FILE="src/common/router/router.ts"
IMPORT_LINE="import { ${MODULE_CAMEL}Router } from \"../../modules/$MODULE_NAME/$MODULE_NAME.router\";"
ROUTE_LINE="    router.use(\"/$MODULE_NAME\", ${MODULE_CAMEL}Router);"

# Crear un archivo temporal
TEMP_FILE=$(mktemp)

# Procesar el archivo con awk para mantener el orden y formato
awk -v import="$IMPORT_LINE" -v route="$ROUTE_LINE" '
    BEGIN {
        in_imports = 1
    }
    # Manejar las importaciones
    /^import {/ {
        if (in_imports) {
            imports[NR] = $0
            next
        }
    }
    # Detectar el fin de las importaciones
    /^export const/ {
        in_imports = 0
        # Imprimir todas las importaciones ordenadas
        for (i in imports) {
            print imports[i]
        }
        # Agregar la nueva importación si no existe
        if (!import_added) {
            print import
            import_added = 1
        }
        print
        next
    }
    # Manejar las rutas
    /router.use/ {
        routes[NR] = $0
        next
    }
    # Manejar el return router
    /return router;/ {
        # Imprimir todas las rutas ordenadas
        for (i in routes) {
            print routes[i]
        }
        # Agregar la nueva ruta si no existe
        if (!route_added) {
            print route
            route_added = 1
        }
        print
        next
    }
    # Imprimir el resto de las líneas
    { print }
' "$ROUTER_FILE" > "$TEMP_FILE"

# Reemplazar el archivo original con el temporal
mv "$TEMP_FILE" "$ROUTER_FILE"

success "Ruta agregada automáticamente al router.ts"
warning "Recuerda registrar el módulo en tu aplicación"
