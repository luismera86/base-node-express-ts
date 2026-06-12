import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { instanceToPlain } from "class-transformer";
import { createBaseRouter } from "../common/router/router";
import { manejadorExcepciones } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import { LoggerService } from "../common/utils/logger.util";
import { openApiDoc } from "../docs/swagger";
import { prisma } from "./prisma.config";
import envConfig from "./env.config";

const app = express();
const logger = new LoggerService("Servidor");

const conectarBaseDatos = async () => {
    try {
        await prisma.$connect();
        logger.info("Base de datos conectada correctamente");
    } catch (error: unknown) {
        logger.error("No se pudo conectar a la base de datos", (error as Error).message);
        process.exit(1);
    }
};

const aplicarMiddlewares = () => {
    app.use(helmet());

    // CORS restringido por configuración. `CORS_ORIGINS="*"` permite todos los orígenes
    // (útil en local); en otros entornos usar una lista separada por comas.
    const origenes = envConfig.CORS_ORIGINS.split(",").map((o) => o.trim());
    app.use(cors(origenes.includes("*") ? undefined : { origin: origenes, credentials: true }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        const jsonOriginal = res.json;
        res.json = function (body) {
            return jsonOriginal.call(this, instanceToPlain(body));
        };
        next();
    });
};

const aplicarRutas = () => {
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

    app.use("*", (req, res, next) => {
        if (req.path.startsWith("/.well-known")) {
            return res.status(204).send();
        }
        next(new NotFoundException("Ruta no encontrada"));
    });

    app.use(manejadorExcepciones);
};

const escuchar = () => {
    app.listen(envConfig.PORT, () => {
        const base = envConfig.API_URL.replace(/\/api$/, "");
        logger.info(`Servidor ejecutándose en ${base}`);
        logger.info(`API       → ${base}/api/v1`);
        logger.info(`Docs      → ${base}/docs`);
    });
};

export const iniciarServidor = async () => {
    await conectarBaseDatos();
    aplicarMiddlewares();
    aplicarRutas();
    escuchar();
};
