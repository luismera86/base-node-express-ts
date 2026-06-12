import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * `omit` global: estos campos sensibles NUNCA se serializan en respuestas.
 * Los casos de uso que necesitan el hash (iniciar-sesion, recuperar/restablecer
 * contraseña, autenticar-usuario, refrescar/cerrar-sesion) lo reactivan por
 * consulta con `omit: { <campo>: false }`.
 */
export const prisma = new PrismaClient({
    adapter,
    omit: {
        usuario: {
            contrasena: true,
            token_recuperacion: true,
            token_recuperacion_expira_en: true,
            token_refresco: true,
            token_refresco_expira_en: true,
        },
    },
});

export type AppPrismaClient = typeof prisma;
