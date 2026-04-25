import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { instanceToPlain } from "class-transformer";
import { createBaseRouter } from "../common/router/router";
import { customExceptions } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import { LoggerService } from "../common/utils/logger.util";
import { openApiDoc } from "../docs/swagger";
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
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.use((req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            return originalJson.call(this, instanceToPlain(body));
        };
        next();
    });
};

const applyRoutes = () => {
    app.use("/api/v1", createBaseRouter());
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

    app.use((req, res, next) => {
        if (req.path.startsWith("/.well-known")) {
            return res.status(204).send();
        }
        next();
    });

    app.use("*", (req, res, next) => {
        next(new NotFoundException("Path not found"));
    });

    app.use(customExceptions);
};

const listen = () => {
    app.listen(envConfig.PORT, () => {
        const base = envConfig.API_URL.replace(/\/api$/, "");
        logger.info(`Server running at ${base}`);
        logger.info(`API       → ${base}/api/v1`);
        logger.info(`Docs      → ${base}/docs`);
    });
};

export const startServer = async () => {
    await connectDatabase();
    applyMiddlewares();
    applyRoutes();
    listen();
};
