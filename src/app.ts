import "reflect-metadata"; 
import express from "express";
import AppDataSource from "./config/datasource.config";
import { LoggerService } from "./common/utils/logger";
import { customExceptions } from "./exceptions/custom-exceptions";
import envConfig from "./config/env.config";
import { openApiDoc } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";

const { PORT } = envConfig;
const logger = new LoggerService("App");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use(customExceptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
    
  })
  .catch((error) => console.log(error));


