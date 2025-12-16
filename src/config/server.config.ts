import express from "express";
import { createBaseRouter } from "../common/router/router";
import { customExceptions } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import { LoggerService } from "../common/utils/logger.util";
import envConfig from "./env.config";
import swaggerUi from "swagger-ui-express";
import { openApiDoc } from "../docs/swagger";
import cors from "cors";
import session from "express-session";
import passport from "./passport/passport.config";
import { instanceToPlain } from "class-transformer";

export class Server {
    private app: express.Application;
    private logger: LoggerService;

    constructor() {
        this.app = express();
        this.logger = new LoggerService("Server");
    }

    public start() {
        this.middleware();
        this.router();
        this.listen();
    }
    private middleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());

        // Middleware para transformar todas las respuestas y excluir campos sensibles
        this.app.use((req, res, next) => {
            const originalJson = res.json;
            res.json = function (body) {
                return originalJson.call(this, instanceToPlain(body));
            };
            next();
        });

        // Configuración de sesión
        this.app.use(
            session({
                secret: envConfig.SESSION_SECRET || "your-secret-key",
                resave: false,
                saveUninitialized: false,
            }),
        );

        // Inicializar Passport
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }

    private router() {
        this.app.use("/api", createBaseRouter());
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
                    onComplete: function () {
                        // Mostrar los headers en cada petición para depuración
                    },
                },
                customSiteTitle: "API Emooti - Documentación",
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

        // Ruta para favicon.ico
        this.app.get("/favicon.ico", (req, res) => {
            res.status(204).send(); // Respuesta vacía para favicon
        });

        this.app.use((req, res, next) => {
            if (req.path.startsWith("/.well-known")) {
                return res.status(204).send(); // Silenciar sin log
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
            this.logger.info(`Server is running on port ${envConfig.PORT}`);
        });
    }
}
