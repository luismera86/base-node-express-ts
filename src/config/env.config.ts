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
  FRONTEND_URL: z.string(),
  API_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  MICROSOFT_CLIENT_ID: z.string(),
  MICROSOFT_CLIENT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MAX_MONTHS_FOR_EVENTS: z.coerce.number(),
  JITSI_URL: z.string(),
  JITSI_JWT_SECRET: z.string(),
});

type EnvConfig = z.infer<typeof envSchema>;

const env = envSchema.safeParse(process.env);

if (!env.success) {
  const formattedErrors = Object.entries(env.error.format())
    .filter(([key]) => key !== "_errors") // Ignorar errores generales
    .map(([key, value]) => ({
      Environment: key,
      Error: Array.isArray(value)
        ? value.join(", ")
        : value?._errors?.join(", ") || "Unknown error",
    }));
  logger.error("Environment variables validation failed");
  console.table(formattedErrors);
  process.exit(1);
}

const envConfig: EnvConfig = env.success ? env.data : ({} as EnvConfig);

export default envConfig;
