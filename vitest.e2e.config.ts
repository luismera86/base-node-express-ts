import { defineConfig } from "vitest/config";

/**
 * Config de los tests e2e: HTTP y DB reales contra la base dedicada de
 * .env.test (creada/migrada por test/setup-e2e-db.ts). Correr con:
 * `pnpm run test:e2e`.
 */
export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["test/**/*.e2e.test.ts"],
        setupFiles: ["test/e2e-setup.ts"],
        // Las suites comparten la DB: se corren en un solo proceso para evitar carreras.
        fileParallelism: false,
        testTimeout: 15000,
        hookTimeout: 30000,
    },
});
