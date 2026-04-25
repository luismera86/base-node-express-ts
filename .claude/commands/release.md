# Release — build, versión, tag y push

Analiza los cambios pendientes, determina el tipo de versión, construye el proyecto, hace commit, versiona con tag y pushea.

## Pasos a seguir en orden

### 1. Verificar estado del repo

```bash
git status
git diff HEAD
```

- Si no hay cambios staged ni unstaged, informar al usuario y detener.

### 2. Analizar los cambios para determinar el tipo de versión

Revisar el diff completo (`git diff HEAD` y `git diff --cached`) y clasificar:

| Tipo      | Cuándo aplicar                                                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **major** | Cambios que rompen compatibilidad: eliminación de endpoints, cambio de contrato de API, renombrado de campos en respuestas públicas |
| **minor** | Features nuevas sin romper lo existente: nuevos endpoints, nuevos módulos, nuevos campos opcionales                                 |
| **patch** | Fixes, refactors internos, ajustes de config, docs, dependencias                                                                    |

Informar al usuario qué tipo detectaste y el motivo **antes de continuar**. Pedir confirmación o corrección.

### 3. Ejecutar lint y build

```bash
npm run lint
npm run build
```

- Si alguno falla, mostrar el error, detener y **no continuar** con el release.

### 4. Ejecutar tests (opcional)

Primero verificar si existen archivos de test en el proyecto:

```bash
find . -name "*.spec.ts" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.test.js" | grep -v node_modules | grep -v dist | head -5
```

- Si **no se encuentran archivos de test**, omitir este paso por completo y continuar.
- Si **sí existen tests**, preguntar al usuario: _"Se encontraron tests en el proyecto. ¿Deseas ejecutarlos antes del release? (s/n)"_
    - Si responde **sí**: ejecutar `npm test`. Si fallan, mostrar el error, detener y **no continuar** con el release.
    - Si responde **no**: omitir y continuar.

### 5. Hacer commit de los cambios pendientes

Stagear los archivos modificados (sin incluir `.env`, archivos de secretos, binarios grandes):

```bash
git add <archivos-relevantes>
```

Redactar un mensaje de commit que resuma los cambios. Usar el formato:

```
<tipo>: <descripción corta>

<detalle opcional si aplica>
```

Donde `<tipo>` es: `feat`, `fix`, `refactor`, `chore`, `docs`, según el cambio.

### 6. Versionar con npm version

Según el tipo determinado en el paso 2:

```bash
npm version patch   # fixes / refactors
npm version minor   # nuevas features
npm version major   # breaking changes
```

Esto actualiza `package.json`, crea el commit de versión y el tag automáticamente.

### 7. Push del commit y del tag

```bash
git push && git push --tags
```

### 8. Confirmar al usuario

Mostrar:

- Versión anterior → versión nueva
- Nombre del tag creado (e.g. `v1.2.3`)
- URL del tag en GitHub si el remote es GitHub (extraer de `git remote get-url origin`)
