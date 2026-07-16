import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { instanceToPlain } from "class-transformer";
import { createBaseRouter } from "../common/router/router";
import { customExceptions } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import { LoggerService } from "../common/utils/logger.util";
import { requestLogger } from "../common/middlewares/requestLogger.middleware";
import { languageResolver } from "../common/middlewares/language.middleware";
import { openApiDoc } from "../docs/swagger";
import { initEventsGateway } from "../modules/events/events.gateway";
import { prisma } from "./prisma.config";
import envConfig from "./env.config";

const app = express();
const logger = new LoggerService("Server");

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully");
    } catch (error: unknown) {
        logger.error("Failed to connect to database", (error as Error).message);
        process.exit(1);
    }
};

const applyMiddlewares = () => {
    // Logging estructurado con x-request-id, primero para cubrir toda la petición.
    app.use(requestLogger);
    app.use(languageResolver);

    app.use(helmet());

    // CORS restringido por configuración. `CORS_ORIGINS="*"` permite todos los orígenes
    // (útil en local); en otros entornos usar una lista separada por comas.
    const origins = envConfig.CORS_ORIGINS.split(",").map((o) => o.trim());
    app.use(cors(origins.includes("*") ? undefined : { origin: origins, credentials: true }));

    app.use(compression());
    app.use(cookieParser());

    // Solo se parsea body JSON (sin urlencoded): un <form> cross-site llega con body
    // vacío y se rechaza — cierra el login-CSRF. Límite de tamaño explícito.
    app.use(express.json({ limit: envConfig.BODY_LIMIT }));

    app.use((req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            return originalJson.call(this, instanceToPlain(body));
        };
        next();
    });
};

const applyRoutes = () => {
    // Health check fuera del prefijo de la API (para probes de infraestructura).
    app.get("/health", async (_req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            res.status(200).json({ status: "ok", database: "up" });
        } catch {
            res.status(503).json({ status: "error", database: "down" });
        }
    });

    app.use("/api/v1", createBaseRouter());

    // Swagger deshabilitado en producción por defecto (SWAGGER_ENABLED).
    if (envConfig.SWAGGER_ENABLED) {
        app.use(
            "/docs",
            swaggerUi.serve,
            swaggerUi.setup(openApiDoc, {
                swaggerOptions: {
                    persistAuthorization: true,
                    displayRequestDuration: true,
                    docExpansion: "none",
                    filter: true,
                    showCommonExtensions: true,
                    tagsSorter: "alpha",
                },
                customSiteTitle: "API - Documentación",
                customCss:
                    ".swagger-ui .topbar { display: none } .auth-wrapper { padding: 10px; border: 1px solid #49cc90; background: rgba(73, 204, 144, 0.1); }",
            }),
        );
    }

    app.use("*", (req, res, next) => {
        if (req.path.startsWith("/.well-known")) {
            return res.status(204).send();
        }
        next(new NotFoundException("errors.PATH_NOT_FOUND"));
    });

    app.use(customExceptions);
};

const listen = () => {
    const server = app.listen(envConfig.PORT, () => {
        const base = envConfig.API_URL.replace(/\/api$/, "");
        logger.info(`Server running at ${base}`);
        logger.info(`API       → ${base}/api/v1`);
        if (envConfig.SWAGGER_ENABLED) logger.info(`Docs      → ${base}/docs`);
        if (envConfig.WS_ENABLED) logger.info(`WS        → ${base}/events (socket.io)`);
        logger.info(`Health    → ${base}/health`);
    });

    // WebSockets opt-in: sin WS_ENABLED=true no se monta socket.io.
    if (envConfig.WS_ENABLED) initEventsGateway(server);
};

/** Arma la app completa sin escuchar el puerto (usado por los tests e2e con supertest). */
export const createApp = () => {
    applyMiddlewares();
    applyRoutes();
    return app;
};

export const startServer = async () => {
    await connectDatabase();
    createApp();
    listen();
};
