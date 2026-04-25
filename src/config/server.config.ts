import express from "express";
import { createBaseRouter } from "../common/router/router";
import { customExceptions } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import { LoggerService } from "../common/utils/logger.util";
import envConfig from "./env.config";
import swaggerUi from "swagger-ui-express";
import { openApiDoc } from "../docs/swagger";
import cors from "cors";
import { instanceToPlain } from "class-transformer";
import { prisma } from "./prisma.config";

export class Server {
    private app: express.Application;
    private logger: LoggerService;

    constructor() {
        this.app = express();
        this.logger = new LoggerService("Server");
    }

    public async start() {
        await this.connectDatabase();
        this.middleware();
        this.router();
        this.listen();
    }

    private async connectDatabase() {
        try {
            await prisma.$connect();
            this.logger.info("Database connected successfully");
        } catch (error: unknown) {
            this.logger.error("Failed to connect to database", (error as Error).message);
            process.exit(1);
        }
    }

    private middleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());

        this.app.use((req, res, next) => {
            const originalJson = res.json;
            res.json = function (body) {
                return originalJson.call(this, instanceToPlain(body));
            };
            next();
        });
    }

    private router() {
        this.app.use("/api/v1", createBaseRouter());
        this.app.use(
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

        this.app.use("/json", (req, res) => {
            res.status(200).json(openApiDoc);
        });

        this.app.use("/up", (req, res) => {
            res.status(200).json({ message: "OK" });
        });

        this.app.get("/favicon.ico", (req, res) => {
            res.status(204).send();
        });

        this.app.use((req, res, next) => {
            if (req.path.startsWith("/.well-known")) {
                return res.status(204).send();
            }
            next();
        });

        this.app.use("*", (req, res, next) => {
            next(new NotFoundException("Path not found"));
        });

        this.app.use(customExceptions);
    }

    private listen() {
        this.app.listen(envConfig.PORT, () => {
            const base = envConfig.API_URL.replace(/\/api$/, "");
            this.logger.info(`Server running at ${base}`);
            this.logger.info(`API       → ${base}/api/v1`);
            this.logger.info(`Docs      → ${base}/docs`);
        });
    }
}
