import "reflect-metadata"; 
import express from "express";
import envConfig from "./config/config";
import AppDataSource from "./config/datasource.config";
import { LoggerService } from "./common/utils/logger";


const { PORT } = envConfig;
const logger = new LoggerService("App");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

AppDataSource.initialize()
  .then(() => {
    logger.log("Database connected");
    app.listen(PORT, () => {
      logger.debug(`Server is running on port ${PORT}`);
    });
    
  })
  .catch((error) => console.log(error));


