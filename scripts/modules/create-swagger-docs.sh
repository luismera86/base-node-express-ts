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
    echo "Uso: npm run create:swagger-docs nombre-modulo"
    exit 1
fi

# Convertir el nombre del módulo a kebab-case si está en camelCase
MODULE_NAME=$(camel_to_kebab "$1")
# Convertir a PascalCase para el nombre de la clase
CLASS_NAME=$(kebab_to_pascal "$MODULE_NAME")
# Convertir a camelCase para el nombre de la variable
CAMEL_NAME=$(kebab_to_camel "$MODULE_NAME")

# Mostrar los nombres generados para depuración
echo "Entrada: $1"
echo "Nombre del módulo: $MODULE_NAME"
echo "Nombre de la clase: $CLASS_NAME"
echo "Nombre camelCase: $CAMEL_NAME"

# Verificar si el módulo existe
if [ ! -d "src/modules/$MODULE_NAME" ]; then
    error "El módulo '$MODULE_NAME' no existe. Primero crea el módulo con: npm run create:module $MODULE_NAME"
fi

# Verificar si la documentación ya existe
if [ -d "src/docs/paths/$MODULE_NAME" ]; then
    warning "La documentación para '$MODULE_NAME' ya existe. Se sobrescribirán los archivos."
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
fi

# Crear la estructura de directorios
mkdir -p "src/docs/paths/$MODULE_NAME" || error "No se pudo crear el directorio de documentación"

# Crear el archivo principal de paths
cat > "src/docs/paths/$MODULE_NAME/$MODULE_NAME.paths.ts" << EOF

import { BasePath } from "../base.path";
import { Crear${CLASS_NAME}Path } from "./crear.path";
import { ObtenerTodos${CLASS_NAME}Path } from "./obtener-todos.path";
import { Obtener${CLASS_NAME}PorIdPath } from "./obtener-por-id.path";
import { Actualizar${CLASS_NAME}Path } from "./actualizar.path";
import { Eliminar${CLASS_NAME}Path } from "./eliminar.path";
import { registry } from "../../swagger";

export class ${CLASS_NAME}Paths extends BasePath {
  constructor() {
    super(registry);
  }

  register(): void {
    new Crear${CLASS_NAME}Path(this.registry).register();
    new ObtenerTodos${CLASS_NAME}Path(this.registry).register();
    new Obtener${CLASS_NAME}PorIdPath(this.registry).register();
    new Actualizar${CLASS_NAME}Path(this.registry).register();
    new Eliminar${CLASS_NAME}Path(this.registry).register();
  }
}
EOF

# Crear el archivo crear.path.ts
cat > "src/docs/paths/$MODULE_NAME/crear.path.ts" << EOF

import { Crear${CLASS_NAME}Schema } from "../../../modules/$MODULE_NAME/schemas/$MODULE_NAME.schema";
import { BasePath } from "../base.path";

export class Crear${CLASS_NAME}Path extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["$MODULE_NAME"],
      method: "post",
      path: "/$MODULE_NAME",
      summary: "Crear $MODULE_NAME",
      request: {
        body: {
          content: {
            "application/json": { schema: Crear${CLASS_NAME}Schema.body },
          },
        },
      },
      responses: {
        201: {
          description: "$CLASS_NAME creado",
          content: {
            "application/json": {
              schema: {
                \$ref: "#/components/schemas/$CLASS_NAME",
              },
            },
          },
        },
        400: {
          description: "Datos inválidos",
        },
        401: {
          description: "No autorizado",
        },
      },
    });
  }
}
EOF

# Crear el archivo obtener-todos.path.ts
cat > "src/docs/paths/$MODULE_NAME/obtener-todos.path.ts" << EOF

import { BasePath } from "../base.path";

export class ObtenerTodos${CLASS_NAME}Path extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["$MODULE_NAME"],
      method: "get",
      path: "/$MODULE_NAME",
      summary: "Obtener todos los $MODULE_NAME",
      responses: {
        200: {
          description: "Lista de $MODULE_NAME",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  \$ref: "#/components/schemas/$CLASS_NAME",
                },
              },
            },
          },
        },
        401: {
          description: "No autorizado",
        },
      },
    });
  }
}
EOF

# Crear el archivo obtener-por-id.path.ts
cat > "src/docs/paths/$MODULE_NAME/obtener-por-id.path.ts" << EOF
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class Obtener${CLASS_NAME}PorIdPath extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["$MODULE_NAME"],
      method: "get",
      path: "/$MODULE_NAME/{id}",
      summary: "Obtener $MODULE_NAME por ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
            description: "ID del $MODULE_NAME",
          },
        },
      ],
      responses: {
        200: {
          description: "$CLASS_NAME encontrado",
          content: {
            "application/json": {
              schema: {
                \$ref: "#/components/schemas/$CLASS_NAME",
              },
            },
          },
        },
        404: {
          description: "$CLASS_NAME no encontrado",
        },
        401: {
          description: "No autorizado",
        },
      },
    });
  }
}
EOF

# Crear el archivo actualizar.path.ts
cat > "src/docs/paths/$MODULE_NAME/actualizar.path.ts" << EOF
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ${CLASS_NAME}Schema } from "../../../modules/$MODULE_NAME/schemas/$MODULE_NAME.schema";
import { BasePath } from "../base.path";

export class Actualizar${CLASS_NAME}Path extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["$MODULE_NAME"],
      method: "patch",
      path: "/$MODULE_NAME/{id}",
      summary: "Actualizar $MODULE_NAME",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
            description: "ID del $MODULE_NAME",
          },
        },
      ],
      request: {
        body: {
          content: {
            "application/json": { schema: ${CLASS_NAME}Schema },
          },
        },
      },
      responses: {
        200: {
          description: "$CLASS_NAME actualizado",
          content: {
            "application/json": {
              schema: {
                \$ref: "#/components/schemas/$CLASS_NAME",
              },
            },
          },
        },
        400: {
          description: "Datos inválidos",
        },
        404: {
          description: "$CLASS_NAME no encontrado",
        },
        401: {
          description: "No autorizado",
        },
      },
    });
  }
}
EOF

# Crear el archivo eliminar.path.ts
cat > "src/docs/paths/$MODULE_NAME/eliminar.path.ts" << EOF
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class Eliminar${CLASS_NAME}Path extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["$MODULE_NAME"],
      method: "delete",
      path: "/$MODULE_NAME/{id}",
      summary: "Eliminar $MODULE_NAME",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
            description: "ID del $MODULE_NAME",
          },
        },
      ],
      responses: {
        200: {
          description: "$CLASS_NAME eliminado",
        },
        404: {
          description: "$CLASS_NAME no encontrado",
        },
        401: {
          description: "No autorizado",
        },
      },
    });
  }
}
EOF

# Actualizar el archivo swagger.ts para incluir el nuevo módulo
SWAGGER_FILE="src/docs/swagger.ts"

# Verificar si el archivo swagger.ts existe
if [ ! -f "$SWAGGER_FILE" ]; then
    error "El archivo $SWAGGER_FILE no existe"
fi

# Función para actualizar el archivo swagger.ts manteniendo el formato
update_swagger_file() {
    local temp_file=$(mktemp)

    # Leer el archivo actual y agregar los nuevos imports y registros
    {
        # Imports básicos
        echo "// src/docs/swagger.ts"
        echo "import { z } from \"zod\";"
        echo "import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from \"@asteasolutions/zod-to-openapi\";"
        echo "import envConfig from \"../config/env.config\";"
        echo ""

        # Imports de schemas
        echo "// Imports de schemas"
        grep "import.*Schema.*from.*modules" "$SWAGGER_FILE" | sort
        if ! grep -q "import.*${CLASS_NAME}Schema" "$SWAGGER_FILE"; then
            echo "import { ${CLASS_NAME}Schema } from \"../modules/$MODULE_NAME/schemas/$MODULE_NAME.schema\";"
        fi
        echo ""

        # Imports de paths
        echo "// Imports de paths"
        grep "import.*Paths.*from.*paths" "$SWAGGER_FILE" | sort
        if ! grep -q "import.*${CLASS_NAME}Paths" "$SWAGGER_FILE"; then
            echo "import { ${CLASS_NAME}Paths } from \"./paths/$MODULE_NAME/$MODULE_NAME.paths\";"
        fi
        echo ""

        # extendZodWithOpenApi
        echo "extendZodWithOpenApi(z); // Habilita \`.openapi()\` en esquemas de Zod"
        echo ""
        echo "export const registry = new OpenAPIRegistry();"
        echo ""

        # Registrar schemas
        echo "// Registrar schemas"
        grep "registry.register" "$SWAGGER_FILE" | sort
        if ! grep -q "registry.register(\"$CLASS_NAME\"" "$SWAGGER_FILE"; then
            echo "registry.register(\"$CLASS_NAME\", ${CLASS_NAME}Schema);"
        fi
        echo ""

        # Registrar paths
        echo "// Registrar paths"
        grep "new.*Paths.*register" "$SWAGGER_FILE" | sort
        if ! grep -q "new ${CLASS_NAME}Paths" "$SWAGGER_FILE"; then
            echo "new ${CLASS_NAME}Paths().register();"
        fi
        echo ""

        # Resto del archivo (desde const generator hasta el final)
        sed -n '/^const generator/,$p' "$SWAGGER_FILE"

    } > "$temp_file"

    # Reemplazar el archivo original
    mv "$temp_file" "$SWAGGER_FILE"
}

# Actualizar el archivo
update_swagger_file

success "✅ Documentación de Swagger creada exitosamente para el módulo '$MODULE_NAME'"
echo ""
echo "📁 Archivos creados:"
echo "  - src/docs/paths/$MODULE_NAME/$MODULE_NAME.paths.ts"
echo "  - src/docs/paths/$MODULE_NAME/crear.path.ts"
echo "  - src/docs/paths/$MODULE_NAME/obtener-todos.path.ts"
echo "  - src/docs/paths/$MODULE_NAME/obtener-por-id.path.ts"
echo "  - src/docs/paths/$MODULE_NAME/actualizar.path.ts"
echo "  - src/docs/paths/$MODULE_NAME/eliminar.path.ts"
echo ""
echo "🔄 Archivo swagger.ts actualizado con:"
echo "  - Import del schema ${CLASS_NAME}Schema"
echo "  - Import de ${CLASS_NAME}Paths"
echo "  - Registro del schema en el registry"
echo "  - Registro de los paths"
echo ""
warning "⚠️  Recuerda personalizar los archivos según las necesidades específicas de tu módulo"
