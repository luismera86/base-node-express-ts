import { LoggerService } from "./common/utils/logger.util";
import { iniciarServidor } from "./config/server.config";
import { cronJobManager } from "./cron-jobs";
import { prisma } from "./config/prisma.config";

const logger = new LoggerService("App");

const main = async () => {
    try {
        await iniciarServidor();

        // Iniciar todos los cron jobs
        cronJobManager.startAllJobs();

        logger.info("Aplicación iniciada correctamente");

        // Manejar el cierre graceful
        process.on("SIGINT", async () => {
            logger.info("Cerrando de forma controlada...");
            await prisma.$disconnect();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("Cerrando de forma controlada...");
            await prisma.$disconnect();
            process.exit(0);
        });
    } catch (error) {
        logger.error("No se pudo iniciar la aplicación", error instanceof Error ? error.message : String(error));
        await prisma.$disconnect();
        process.exit(1);
    }
};

main();
