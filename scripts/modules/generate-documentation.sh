#!/usr/bin/env bash

# Directorio que contiene el módulo
MODULE_DIR=$1

# Nombre del módulo
MODULE_NAME=$(basename "$MODULE_DIR")

# Directorio de salida para la documentación
DOC_DIR="./src/docs/paths/$MODULE_NAME"

# Generar archivo entity.paths.ts
mkdir -p "$DOC_DIR"

# Generar archivo entity.paths.ts
echo "import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';" > "$DOC_DIR/entity.paths.ts"
echo "import { $MODULE_DIR } from '../$MODULE_NAME';" >> "$DOC_DIR/entity.paths.ts"
echo "const registry = new OpenAPIRegistry();" >> "$DOC_DIR/entity.paths.ts"
echo "registry.register('$MODULE_NAME', $MODULE_NAME);" >> "$DOC_DIR/entity.paths.ts"

# Generar paths en la carpeta docs en base al router.ts
ROUTER_PATH="./src/modules/$MODULE_DIR/$MODULE_NAME.router.ts"
ROUTES=$(node -e "require('$ROUTER_PATH').routes")

for route in $ROUTES; do
  ROUTE_NAME=$(echo "$route" | cut -d '/' -f 1)
  ROUTE_METHOD=$(echo "$route" | cut -d '/' -f 2)
  ROUTE_PATH=$(echo "$route" | cut -d '/' -f 3-)

  # Obtener el schema para la ruta
  SCHEMA=$(node -e "require('../../modules/$MODULE_NAME/schemas/$MODULE_NAME.schema.ts').$MODULE_NAME")

  # Generar parámetros según el schema
  PARAMETERS=""
  for property in $(echo "$SCHEMA" | jq -r 'keys[]'); do
    TYPE=$(echo "$SCHEMA" | jq -r ".${property}.type")
    DESCRIPTION=$(echo "$SCHEMA" | jq -r ".${property}.description")
    NULLABLE=$(echo "$SCHEMA" | jq -r ".${property}.nullable")
    REQUIRED=$(if [ "$NULLABLE" = "true" ]; then echo "false"; else echo "true"; fi)

    PARAMETERS+="
      {
        name: '${property}',
        in: 'body',
        required: ${REQUIRED},
        schema: {
          type: '${TYPE}',
          description: '${DESCRIPTION}',
        },
      },
    "
  done

  # Generar el nombre de la clase
  CLASS_NAME=$(echo "$ROUTE_NAME" | sed -e 's/-/ /g' -e 's/ /_/g' -e 's/^./\U&/')

  echo "import { $MODULE_NAME } from '../$MODULE_NAME';" > "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "import { UserSchema } from '../../../modules/user/schemas/user.schema';" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "import { BasePath } from '../base.path';" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "export class ${CLASS_NAME}Path extends BasePath {" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "  register(): void {" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "    this.registry.registerPath({" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      tags: ['$MODULE_NAME']," >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      method: '$ROUTE_METHOD'," >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      path: '$ROUTE_PATH'," >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      summary: ''" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      parameters: [" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "$PARAMETERS" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "      ]" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "    });" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "  }" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
  echo "}" >> "$DOC_DIR/${CLASS_NAME}.path.ts"
done

# Generar archivo openapi.json
echo "{}" > "$DOC_DIR/openapi.json"
node -e "const registry = require('$DOC_DIR/entity.paths.ts').registry; const openapi = registry.generateDocument({ openapi: '3.0.0' }); require('fs').writeFileSync('$DOC_DIR/openapi.json', JSON.stringify(openapi, null, 2));"