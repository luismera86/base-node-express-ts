import "reflect-metadata"; 
import express from "express";
import AppDataSource from "./config/datasource.config";
import { LoggerService } from "./common/utils/logger";
import { customExceptions } from "./exceptions/custom-exceptions";
import envConfig from "./config/env.config";
import { openApiDoc } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import { NotFoundException } from "./exceptions/exceptions";
import { BaseRouter } from "./common/router/router";

const { PORT } = envConfig;
const logger = new LoggerService("App");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
app.use("/api", BaseRouter.router());

app.use("*", (req, res, next) => {
  next(new NotFoundException("Path not found"));
});
app.use(customExceptions);
AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
    
  })
  .catch((error) => console.log(error));


