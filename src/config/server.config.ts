import express from "express";
import { BaseRouter } from "../common/router/router";
import { customExceptions } from "../exceptions/custom-exceptions";
import { NotFoundException } from "../exceptions/exceptions";
import AppDataSource from "./datasource.config";
import { LoggerService } from "../common/utils/logger";
import envConfig from "./env.config";
import swaggerUi from "swagger-ui-express";
import { openApiDoc } from "../docs/swagger";
import cors from "cors";
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
    this.database();
    this.listen();
  }

  private middleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  private router() {
    this.app.use("/api", BaseRouter.router);
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
    this.app.use("*", (req, res, next) => {
      next(new NotFoundException("Path not found"));
    });
    this.app.use(customExceptions);
  }

  private database() {
    AppDataSource.initialize()
      .then(() => {
        this.logger.info("Database connected");
      })
      .catch((error) => this.logger.error(error));
  }

  private listen() {
    this.app.listen(envConfig.PORT, () => {
      this.logger.info(`Server is running on port ${envConfig.PORT}`);
    });
  }
}
