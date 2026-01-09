import { LoggerService } from "./common/utils/logger.util";
import { Server } from "./config/server.config";
import { cronJobManager } from "./cron-jobs";

const app = new Server();
app.start();

const logger = new LoggerService("App");

// Iniciar todos los cron jobs
cronJobManager.startAllJobs();

logger.info("Application started");
