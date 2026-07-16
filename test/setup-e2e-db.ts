/**
 * Prepara la base de datos de los tests e2e: la crea si no existe y aplica las
 * migraciones pendientes (`prisma migrate deploy`, no destructivo). La DB de
 * desarrollo nunca se toca — cinturón de seguridad: si el nombre de la DB no
 * contiene "test", el setup aborta.
 *
 * Se ejecuta antes de vitest en `pnpm run test:e2e`.
 */
import { execSync } from "child_process";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env.test", override: true });

const main = async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL no está definida en .env.test");

    const parsed = new URL(url);
    const dbName = parsed.pathname.replace(/^\//, "");

    if (!dbName.includes("test")) {
        throw new Error(
            `Cinturón de seguridad: la DB de e2e se llama "${dbName}" y no contiene "test". ` +
                "Revisa DATABASE_URL en .env.test — este script se niega a tocar una DB que no sea de test.",
        );
    }

    // Crear la DB si no existe (conectando a la DB administrativa "postgres").
    const adminUrl = new URL(url);
    adminUrl.pathname = "/postgres";
    const client = new Client({ connectionString: adminUrl.toString() });
    await client.connect();
    try {
        const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
        if (exists.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Base de datos "${dbName}" creada`);
        }
    } finally {
        await client.end();
    }

    // Aplicar migraciones pendientes (no destructivo).
    execSync("pnpm prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: url },
    });

    console.log(`✅ DB de e2e lista: ${dbName}`);
};

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
