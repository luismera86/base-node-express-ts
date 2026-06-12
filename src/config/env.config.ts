import dotenv from "dotenv";
import { z } from "zod";
import { LoggerService } from "../common/utils/logger.util";

// Cargar siempre el archivo .env en la raíz del proyecto
dotenv.config();

const logger = new LoggerService("EnvConfig");

const envSchema = z.object({
    NODE_ENV: z.enum(["local", "dev", "qa", "prod"]).default("local"),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
    PORT: z.string().refine((val) => !isNaN(Number(val)), {
        message: "PORT must be a number",
    }),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_DAYS: z
        .string()
        .default("7")
        .refine((val) => !isNaN(Number(val)), { message: "JWT_REFRESH_EXPIRES_DAYS must be a number" }),
    API_URL: z.string(),
    CORS_ORIGINS: z.string().default("*"),
});

type EnvConfig = z.infer<typeof envSchema>;

const env = envSchema.safeParse(process.env);

if (!env.success) {
    const formattedErrors = Object.entries(env.error.format())
        .filter(([key]) => key !== "_errors") // Ignorar errores generales
        .map(([key, value]) => ({
            Environment: key,
            Error: Array.isArray(value) ? value.join(", ") : value?._errors?.join(", ") || "Unknown error",
        }));
    logger.error("Environment variables validation failed");
    console.table(formattedErrors);
    process.exit(1);
}

const envConfig: EnvConfig = env.success ? env.data : ({} as EnvConfig);

export default envConfig;
