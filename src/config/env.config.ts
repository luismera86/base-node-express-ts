import dotenv from "dotenv";
import { z } from "zod";
import { LoggerService } from "../common/utils/logger.util";

// Determinar el entorno actual
const NODE_ENV = process.env.NODE_ENV || "local";

// Cargar el archivo .env correspondiente al entorno
dotenv.config({ path: `.env.${NODE_ENV}` });

const logger = new LoggerService("EnvConfig");

const envSchema = z.object({
    NODE_ENV: z.enum(["local", "dev", "qa", "prod"]).default("local"),
    DB_HOST: z.string(),
    DB_NAME: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z.string().refine((val) => !isNaN(Number(val)), {
        message: "DB_PORT must be a number",
    }),
    // DB_SYNCHRONIZE: z.boolean().optional().default(false),
    SECRET_KEY: z.string().min(10, "SECRET_KEY must be at least 10 characters long.").optional(),
    PORT: z.string().refine((val) => !isNaN(Number(val)), {
        message: "PORT must be a number",
    }),
    JWT_SECRET: z.string(),
    SESSION_SECRET: z.string().min(10, "SESSION_SECRET must be at least 10 characters long."),
    API_URL: z.string(),
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
