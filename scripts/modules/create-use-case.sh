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

# Verificar si se proporcionaron los argumentos necesarios
if [ -z "$1" ] || [ -z "$2" ]; then
    error "Por favor, proporciona el nombre del módulo y el nombre del caso de uso"
    echo "Uso: npm run create:use-case nombre-modulo nombre-caso-uso"
    exit 1
fi

# Obtener los argumentos
MODULE_NAME=$(camel_to_kebab "$1")
USE_CASE_NAME=$(camel_to_kebab "$2")

# Convertir nombres a PascalCase
MODULE_CLASS_NAME=$(kebab_to_pascal "$MODULE_NAME")
USE_CASE_CLASS_NAME=$(kebab_to_pascal "$USE_CASE_NAME")

# Verificar si el módulo existe
if [ ! -d "src/modules/$MODULE_NAME" ]; then
    error "El módulo '$MODULE_NAME' no existe"
fi

# Verificar si el caso de uso ya existe
if [ -f "src/modules/$MODULE_NAME/use-cases/$USE_CASE_NAME.use-case.ts" ]; then
    error "El caso de uso '$USE_CASE_NAME' ya existe en el módulo '$MODULE_NAME'"
fi

# Crear el archivo del caso de uso
cat > "src/modules/$MODULE_NAME/use-cases/$USE_CASE_NAME.use-case.ts" << EOF
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";
import { ${MODULE_CLASS_NAME} } from "../entities/$MODULE_NAME.entity";

export class ${USE_CASE_CLASS_NAME}UseCase {
    private readonly logger: LoggerService = new LoggerService("${USE_CASE_CLASS_NAME}UseCase");


    async execute(): Promise<${MODULE_CLASS_NAME} | ${MODULE_CLASS_NAME}[] | void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // TODO: Implementar la lógica del caso de uso
            await queryRunner.commitTransaction();
        } catch (error: any) {
            this.logger.error("Error in ${USE_CASE_NAME}", error.message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
EOF

success "Caso de uso '$USE_CASE_NAME' creado exitosamente en el módulo '$MODULE_NAME'"
warning "Recuerda implementar la lógica del caso de uso" 