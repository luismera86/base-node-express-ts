import dotenv from "dotenv";
import { z } from "zod";
import { LoggerService } from "../common/utils/logger.util";

// Cargar siempre el archivo .env en la raíz del proyecto
dotenv.config();

const logger = new LoggerService("ConfigEntorno");

const envSchema = z.object({
    NODE_ENV: z.enum(["local", "dev", "qa", "prod"]).default("local"),
    DATABASE_URL: z.string().url("DATABASE_URL debe ser una cadena de conexión PostgreSQL válida"),
    PORT: z.string().refine((val) => !isNaN(Number(val)), {
        message: "PORT debe ser un número",
    }),
    JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_DAYS: z
        .string()
        .default("7")
        .refine((val) => !isNaN(Number(val)), { message: "JWT_REFRESH_EXPIRES_DAYS debe ser un número" }),
    API_URL: z.string(),
    CORS_ORIGINS: z.string().default("*"),
});

type EnvConfig = z.infer<typeof envSchema>;

const env = envSchema.safeParse(process.env);

if (!env.success) {
    const erroresFormateados = Object.entries(env.error.format())
        .filter(([key]) => key !== "_errors") // Ignorar errores generales
        .map(([key, value]) => ({
            Variable: key,
            Error: Array.isArray(value) ? value.join(", ") : value?._errors?.join(", ") || "Error desconocido",
        }));
    logger.error("Falló la validación de las variables de entorno");
    console.table(erroresFormateados);
    process.exit(1);
}

const envConfig: EnvConfig = env.success ? env.data : ({} as EnvConfig);

export default envConfig;
