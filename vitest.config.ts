import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        env: {
            NODE_ENV: "local",
            DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/mydb",
            PORT: "3000",
            JWT_SECRET: "test_secret_min_32_chars_long_padding_value",
            API_URL: "http://localhost:3000/api",
            CORS_ORIGINS: "*",
        },
        include: ["src/**/*.{test,spec}.ts", "test/**/*.{test,spec}.ts"],
        passWithNoTests: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.{test,spec}.ts", "src/docs/**", "src/seeds/**"],
        },
    },
});
