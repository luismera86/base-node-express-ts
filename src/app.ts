import "reflect-metadata"; 
import express from "express";
import envConfig from "./config/config";
import AppDataSource from "./config/datasource.config";
import { logger } from "./common/utils/logger";


const { PORT } = envConfig;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
    
  })
  .catch((error) => logger.error(error));


