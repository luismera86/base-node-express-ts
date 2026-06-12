import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * `omit` global: estos campos sensibles NUNCA se serializan en respuestas.
 * Los use cases que necesitan el hash (login, reset/forgot-password, authUser,
 * refresh/logout) lo reactivan por consulta con `omit: { <campo>: false }`.
 */
export const prisma = new PrismaClient({
    adapter,
    omit: {
        user: {
            password: true,
            reset_token: true,
            reset_token_expires_at: true,
            refresh_token: true,
            refresh_token_expires_at: true,
        },
    },
});

export type AppPrismaClient = typeof prisma;
