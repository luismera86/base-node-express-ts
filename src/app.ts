import { LoggerService } from "./common/utils/logger.util";
import AppDataSource from "./config/datasource.config";
import { Server } from "./config/server.config";
import { cronJobManager } from "./cron-jobs";

const app = new Server();
app.start();

const logger = new LoggerService("App");

// Iniciar todos los cron jobs
cronJobManager.startAllJobs();

AppDataSource.initialize()
    .then(() => {
        logger.info("Database connected");
    })
    .catch((error) => {
        logger.error("Error connecting to database", error);
    });
