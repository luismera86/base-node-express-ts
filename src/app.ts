import { LoggerService } from "./common/utils/logger.util";
import { Server } from "./config/server.config";
import { cronJobManager } from "./cron-jobs";
import { prisma } from "./config/prisma.config";

const logger = new LoggerService("App");

const main = async () => {
    try {
        const app = new Server();
        await app.start();

        // Iniciar todos los cron jobs
        cronJobManager.startAllJobs();

        logger.info("Application started successfully");

        // Manejar el cierre graceful
        process.on("SIGINT", async () => {
            logger.info("Shutting down gracefully...");
            await prisma.$disconnect();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("Shutting down gracefully...");
            await prisma.$disconnect();
            process.exit(0);
        });
    } catch (error) {
        logger.error("Failed to start application", error instanceof Error ? error.message : String(error));
        await prisma.$disconnect();
        process.exit(1);
    }
};

main();
