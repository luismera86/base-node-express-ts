import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Con zod-to-openapi v8 + zod 4, `.openapi()` solo existe en schemas creados
// DESPUÉS de extendZodWithOpenApi: cada módulo que crea schemas debe extender
// antes, sin depender del orden de imports de quien lo consume.
extendZodWithOpenApi(z);

/**
 * Política de contraseñas reutilizable (registro y reset): entre 8 y 128
 * caracteres, con al menos una minúscula, una mayúscula, un número y un
 * carácter especial. El login NO aplica esta política (solo tipo y longitud
 * máxima), para no rechazar credenciales legítimas creadas antes de un cambio
 * de reglas. El mensaje sale traducido por el error handler.
 */
export const strongPasswordSchema = z
    .string()
    .min(8, "errors.WEAK_PASSWORD")
    .max(128, "errors.WEAK_PASSWORD")
    .regex(/[a-z]/, "errors.WEAK_PASSWORD")
    .regex(/[A-Z]/, "errors.WEAK_PASSWORD")
    .regex(/\d/, "errors.WEAK_PASSWORD")
    .regex(/[^A-Za-z0-9]/, "errors.WEAK_PASSWORD");
