import dotenv from "dotenv";
import { z } from "zod";

// Cargar siempre el archivo .env en la raíz del proyecto
dotenv.config();

/**
 * Schema del entorno: única fuente de verdad de la configuración.
 * Si falta una variable obligatoria o hay un valor inválido, la app NO arranca
 * (fail-fast listando todos los errores). Coerción de tipos incluida:
 * PORT llega como number, MAIL_SECURE como boolean, etc.
 */
const envSchema = z
    .object({
        NODE_ENV: z.enum(["local", "dev", "qa", "prod"]).default("local"),
        PORT: z.coerce.number().int().positive().default(3000),
        DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
        API_URL: z.string(),

        // Secretos JWT: uno para access y otro DISTINTO para refresh (validación cruzada abajo).
        JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters long"),
        JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters long"),
        JWT_ACCESS_EXPIRES: z.string().default("15m"),
        JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().positive().default(7),

        // Flag `Secure` de las cookies de auth (solo HTTPS). Sin valor: true en prod, false en el resto.
        COOKIE_SECURE: z
            .enum(["true", "false"])
            .transform((v) => v === "true")
            .optional(),

        CORS_ORIGINS: z.string().default("*"),
        BODY_LIMIT: z.string().default("100kb"),

        // SMTP: sin MAIL_HOST los correos se loguean en vez de enviarse (útil en local).
        MAIL_HOST: z.string().optional(),
        MAIL_PORT: z.coerce.number().int().positive().default(587),
        MAIL_SECURE: z
            .enum(["true", "false"])
            .transform((v) => v === "true")
            .default("false"),
        MAIL_USER: z.string().optional(),
        MAIL_PASSWORD: z.string().optional(),
        MAIL_FROM: z.string().default("no-reply@example.com"),

        // Base del frontend para armar los enlaces de verificación / recuperación.
        FRONTEND_URL: z.string().default("http://localhost:5173"),
        PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
        EMAIL_VERIFICATION_TTL_MINUTES: z.coerce.number().int().positive().default(1440),

        // Sin valor: habilitado salvo en prod.
        SWAGGER_ENABLED: z
            .enum(["true", "false"])
            .transform((v) => v === "true")
            .optional(),

        LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    })
    .superRefine((env, ctx) => {
        if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
            ctx.addIssue({
                code: "custom",
                path: ["JWT_REFRESH_SECRET"],
                message: "JWT_REFRESH_SECRET must be different from JWT_ACCESS_SECRET",
            });
        }
    });

const env = envSchema.safeParse(process.env);

if (!env.success) {
    const formattedErrors = env.error.issues.map((issue) => ({
        Environment: issue.path.join(".") || "(root)",
        Error: issue.message,
    }));
    // No usamos LoggerService aquí para evitar un ciclo de imports (el logger lee este config).
    console.error("Environment variables validation failed");
    console.table(formattedErrors);
    process.exit(1);
}

const parsed = env.data;

const envConfig = {
    ...parsed,
    // Defaults condicionados al entorno.
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "prod",
    SWAGGER_ENABLED: parsed.SWAGGER_ENABLED ?? parsed.NODE_ENV !== "prod",
};

export type EnvConfig = typeof envConfig;

export default envConfig;
