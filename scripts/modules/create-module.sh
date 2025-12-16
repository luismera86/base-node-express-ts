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

# Mostrar los nombres generados para depuración
echo "Input: $1"
echo "Module Name: $MODULE_NAME"
echo "Class Name: $CLASS_NAME"

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
mkdir -p "src/modules/$MODULE_NAME/entities" || error "No se pudo crear el directorio entities"
mkdir -p "src/modules/$MODULE_NAME/schemas" || error "No se pudo crear el directorio schemas"

# Asegurar carpeta de repositorios comunes
mkdir -p "src/common/repositories" || error "No se pudo crear el directorio src/common/repositories"

# Archivo unificado de repositorios: inicializar y calcular nombre camel del módulo
REPO_INDEX_FILE="src/common/repositories/repositories.ts"
MODULE_CAMEL=$(kebab_to_camel "$MODULE_NAME")
if [ ! -f "$REPO_INDEX_FILE" ]; then
    cat > "$REPO_INDEX_FILE" << EOF
import AppDataSource from "../../config/datasource.config";

EOF
fi

IMPORT_LINE="import { ${CLASS_NAME} } from \"../../modules/$MODULE_NAME/entities/$MODULE_NAME.entity\";"
EXPORT_LINE="export const ${MODULE_CAMEL}Repository = AppDataSource.getRepository(${CLASS_NAME});"

if ! grep -qF "$IMPORT_LINE" "$REPO_INDEX_FILE"; then
    # Insert import line before the first export entry if any, otherwise append at end
    if grep -qE '^export ' "$REPO_INDEX_FILE"; then
        awk -v imp="$IMPORT_LINE" 'BEGIN{inserted=0} /^export / && !inserted{print imp; inserted=1} {print}' "$REPO_INDEX_FILE" > "${REPO_INDEX_FILE}.tmp" && mv "${REPO_INDEX_FILE}.tmp" "$REPO_INDEX_FILE"
    else
        echo "$IMPORT_LINE" >> "$REPO_INDEX_FILE"
    fi
fi

if ! grep -qF "$EXPORT_LINE" "$REPO_INDEX_FILE"; then
    # Ensure a blank line separates imports and exports, and one blank line after each export
    # Append export at end with a preceding blank line
    printf "\n%s\n\n" "$EXPORT_LINE" >> "$REPO_INDEX_FILE"
fi

# Crear el archivo de entidad
cat > "src/modules/$MODULE_NAME/entities/$MODULE_NAME.entity.ts" << EOF
import { Column } from "typeorm";
import { Entity } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { ${CLASS_NAME}Schema } from "../schemas/$MODULE_NAME.schema";

@Entity()
export class ${CLASS_NAME} extends BaseEntity implements Partial<${CLASS_NAME}Schema> {
    @Column()
    name: string;
}
EOF

# Crear el archivo de esquema
cat > "src/modules/$MODULE_NAME/schemas/$MODULE_NAME.schema.ts" << EOF
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const Create${CLASS_NAME}Schema = {
    body: z.object({
        name: z.string().openapi({ example: "Example Name", description: "Name of ${MODULE_NAME}" }),
    }).openapi("${CLASS_NAME}")
};

export const Update${CLASS_NAME}Schema = {
    params: z.object({
      id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "${CLASS_NAME} id" })),
    }),
    body: Create${CLASS_NAME}Schema.body.partial(),
};

export const ${CLASS_NAME}Schema = Create${CLASS_NAME}Schema.body.extend({
    id: z.number(),
});

export const Delete${CLASS_NAME}Schema = {
    params: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "${CLASS_NAME} id" })),
};

export const GetOne${CLASS_NAME}Schema = {
    params: z.object({
        id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().openapi({ example: 1, description: "${CLASS_NAME} id" })),
    }),
};

export type Create${CLASS_NAME}Dto = z.infer<typeof Create${CLASS_NAME}Schema.body>;
export type Update${CLASS_NAME}Dto = z.infer<typeof Update${CLASS_NAME}Schema.body>;
export type ${CLASS_NAME}Schema = z.infer<typeof ${CLASS_NAME}Schema>;
EOF

# Crear los archivos de casos de uso
cat > "src/modules/$MODULE_NAME/use-cases/create-$MODULE_NAME.use-case.ts" << EOF
import { BadRequestException } from "../../../exceptions/exceptions";
import { ${CLASS_NAME} } from "../entities/$MODULE_NAME.entity";
import { Create${CLASS_NAME}Dto } from "../schemas/$MODULE_NAME.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("Create${CLASS_NAME}UseCase");

export const create${CLASS_NAME} = async (data: Create${CLASS_NAME}Dto): Promise<${CLASS_NAME}> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
        try {
            const existing${CLASS_NAME} = await queryRunner.manager.findOne(${CLASS_NAME}, { where: { name: data.name } });
            if (existing${CLASS_NAME}) throw new BadRequestException("${CLASS_NAME} already exists");

            const created${CLASS_NAME} = queryRunner.manager.create(${CLASS_NAME}, data);
            await queryRunner.manager.save(created${CLASS_NAME});
            await queryRunner.commitTransaction();
            return created${CLASS_NAME};
        } catch (error: unknown) {
            logger.error("Error creating ${MODULE_NAME}", (error as Error).message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/get-all-$MODULE_NAME.use-case.ts" << EOF
import { ${CLASS_NAME} } from "../entities/$MODULE_NAME.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import { ${MODULE_CAMEL}Repository } from "../../../common/repositories/repositories";

const logger = new LoggerService("GetAll${CLASS_NAME}UseCase");

export const getAll${CLASS_NAME}s = async (): Promise<${CLASS_NAME}[]> => {
    try {
        const $(kebab_to_camel "$MODULE_NAME")s = await ${MODULE_CAMEL}Repository.find();
        return $(kebab_to_camel "$MODULE_NAME")s;
    } catch (error: unknown) {
        logger.error("Error getting all ${MODULE_NAME}s", (error as Error).message);
        throw error;
    }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/get-one-$MODULE_NAME.use-case.ts" << EOF
import { ${MODULE_CAMEL}Repository } from "../../../common/repositories/repositories";
import { LoggerService } from "../../../common/utils/logger.util";
import { NotFoundException } from "../../../exceptions/exceptions";
import { ${CLASS_NAME} } from "../entities/$MODULE_NAME.entity";

const logger = new LoggerService("GetOne${CLASS_NAME}UseCase");

export const getOne${CLASS_NAME} = async (param: string, getBy: string = "id"): Promise<${CLASS_NAME}> => {
    try {
        const $(kebab_to_camel "$MODULE_NAME") = await ${MODULE_CAMEL}Repository.findOne({ where: { [getBy]: param } });
        if (!$(kebab_to_camel "$MODULE_NAME")) throw new NotFoundException("${CLASS_NAME} not found");
        return $(kebab_to_camel "$MODULE_NAME");
    } catch (error: unknown) {
        logger.error("Error getting ${MODULE_NAME}", (error as Error).message);
        throw error;
    }
};
EOF

# Crear archivo de repositorio común para este módulo
# Agregar entrada en un archivo unificado de repositorios
REPO_INDEX_FILE="src/common/repositories/repositories.ts"
MODULE_CAMEL=$(kebab_to_camel "$MODULE_NAME")
if [ ! -f "$REPO_INDEX_FILE" ]; then
    cat > "$REPO_INDEX_FILE" << EOF
import AppDataSource from "../../config/datasource.config";

EOF
fi

IMPORT_LINE="import { ${CLASS_NAME} } from \"../../modules/$MODULE_NAME/entities/$MODULE_NAME.entity\";"
EXPORT_LINE="export const ${MODULE_CAMEL}Repository = AppDataSource.getRepository(${CLASS_NAME});"

if ! grep -qF "$IMPORT_LINE" "$REPO_INDEX_FILE"; then
    echo "$IMPORT_LINE" >> "$REPO_INDEX_FILE"
fi
if ! grep -qF "$EXPORT_LINE" "$REPO_INDEX_FILE"; then
    echo "$EXPORT_LINE" >> "$REPO_INDEX_FILE"
fi

cat > "src/modules/$MODULE_NAME/use-cases/update-$MODULE_NAME.use-case.ts" << EOF
import { NotFoundException } from "../../../exceptions/exceptions";
import { ${CLASS_NAME} } from "../entities/$MODULE_NAME.entity";
import { Update${CLASS_NAME}Dto } from "../schemas/$MODULE_NAME.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("Update${CLASS_NAME}UseCase");

export const update${CLASS_NAME} = async (id: number, data: Update${CLASS_NAME}Dto): Promise<${CLASS_NAME}> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(${CLASS_NAME}, id, data);
            const updated${CLASS_NAME} = await queryRunner.manager.findOne(${CLASS_NAME}, { where: { id } });
            if (!updated${CLASS_NAME}) throw new NotFoundException("${CLASS_NAME} not found");
            
            await queryRunner.commitTransaction();
            return updated${CLASS_NAME};
        } catch (error: unknown) {
            logger.error("Error updating ${MODULE_NAME}", (error as Error).message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
};
EOF

cat > "src/modules/$MODULE_NAME/use-cases/delete-$MODULE_NAME.use-case.ts" << EOF
import { NotFoundException } from "../../../exceptions/exceptions";
import { ${CLASS_NAME} } from "../entities/$MODULE_NAME.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("Delete${CLASS_NAME}UseCase");

export const delete${CLASS_NAME} = async (id: number): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const $(kebab_to_camel "$MODULE_NAME") = await queryRunner.manager.findOne(${CLASS_NAME}, { where: { id } });
        if (!$(kebab_to_camel "$MODULE_NAME")) throw new NotFoundException("${CLASS_NAME} not found");

        await queryRunner.manager.remove($(kebab_to_camel "$MODULE_NAME"));
        await queryRunner.commitTransaction();
    } catch (error: unknown) {
        logger.error("Error deleting ${MODULE_NAME}", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
EOF

# Crear el archivo del controlador
cat > "src/modules/$MODULE_NAME/$MODULE_NAME.controller.ts" << EOF
import { Request, Response, NextFunction } from "express";
import { getAll${CLASS_NAME}s } from "./use-cases/get-all-$MODULE_NAME.use-case";
import { getOne${CLASS_NAME} } from "./use-cases/get-one-$MODULE_NAME.use-case";
import { create${CLASS_NAME} } from "./use-cases/create-$MODULE_NAME.use-case";
import { update${CLASS_NAME} } from "./use-cases/update-$MODULE_NAME.use-case";
import { delete${CLASS_NAME} } from "./use-cases/delete-$MODULE_NAME.use-case";
import { Update${CLASS_NAME}Dto } from "./schemas/$MODULE_NAME.schema";

export const getAll${CLASS_NAME}sController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const $(kebab_to_camel "$MODULE_NAME")s = await getAll${CLASS_NAME}s();
        res.json($(kebab_to_camel "$MODULE_NAME")s);
    } catch (error) {
        next(error);
    }
};

export const getOne${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const $(kebab_to_camel "$MODULE_NAME") = await getOne${CLASS_NAME}(id);
        res.status(200).json($(kebab_to_camel "$MODULE_NAME"));
    } catch (error) {
        next(error);
    }
};

export const create${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const $(kebab_to_camel "$MODULE_NAME") = await create${CLASS_NAME}(req.body);
        res.status(201).json($(kebab_to_camel "$MODULE_NAME"));
    } catch (error) {
        next(error);
    }
};

export const update${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const $(kebab_to_camel "$MODULE_NAME") = await update${CLASS_NAME}(+id, req.body as Update${CLASS_NAME}Dto);
        res.status(200).json($(kebab_to_camel "$MODULE_NAME"));
    } catch (error) {
        next(error);
    }
};

export const delete${CLASS_NAME}Controller = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await delete${CLASS_NAME}(+id);
        res.status(200).json({ status: "ok", message: "Successfully deleted ${CLASS_NAME}" });
    } catch (error) {
        next(error);
    }
};
EOF

# Crear el archivo del router
cat > "src/modules/$MODULE_NAME/$MODULE_NAME.router.ts" << EOF
import { Router } from "express";
import {
    getAll${CLASS_NAME}sController,
    getOne${CLASS_NAME}Controller,
    create${CLASS_NAME}Controller,
    update${CLASS_NAME}Controller,
    delete${CLASS_NAME}Controller
} from "./$MODULE_NAME.controller";

export const create${CLASS_NAME}Router = (): Router => {
    const router = Router();

    router.get("/", getAll${CLASS_NAME}sController);
    router.get("/:id", getOne${CLASS_NAME}Controller);
    router.post("/", create${CLASS_NAME}Controller);
    router.patch("/:id", update${CLASS_NAME}Controller);
    router.delete("/:id", delete${CLASS_NAME}Controller);

    return router;
};
EOF

success "Módulo '$MODULE_NAME' creado exitosamente!"

# Insertar la nueva ruta en router.ts
ROUTER_FILE="src/common/router/router.ts"
IMPORT_LINE="import { create${CLASS_NAME}Router } from \"../../modules/$MODULE_NAME/$MODULE_NAME.router\";"
ROUTE_LINE="    router.use(\"/$MODULE_NAME\", create${CLASS_NAME}Router());"

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