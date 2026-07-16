/**
 * Setup de vitest para e2e: carga .env.test ANTES de que cualquier import de la
 * app lea process.env (el dotenv de env.config no pisa valores ya presentes) y
 * trunca las tablas al inicio de la corrida.
 */
import dotenv from "dotenv";
import { beforeAll } from "vitest";

dotenv.config({ path: ".env.test", override: true });

const dbName = new URL(process.env.DATABASE_URL as string).pathname.replace(/^\//, "");
if (!dbName.includes("test")) {
    throw new Error(`Cinturón de seguridad: la DB "${dbName}" no contiene "test" — abortando los e2e.`);
}

beforeAll(async () => {
    // Import dinámico: prisma debe instanciarse DESPUÉS de cargar .env.test.
    const { prisma } = await import("../src/config/prisma.config");
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
});
