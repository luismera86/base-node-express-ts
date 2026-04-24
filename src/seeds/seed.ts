import { prisma } from "../config/prisma.config";
import { LoggerService } from "../common/utils/logger.util";

const logger = new LoggerService("Seed");

const runSeeds = async () => {
    await prisma.$connect();
    logger.info("Database connected for seeding");

    try {
        // TODO: add seed logic here
        logger.info("All seeds executed successfully");
    } catch (error) {
        logger.error("Error during seeding", (error as Error).message);
        throw error;
    } finally {
        await prisma.$disconnect();
        logger.info("Database connection closed");
    }
};

runSeeds().catch((error) => {
    logger.error("Fatal error during seeding", error.message);
    process.exit(1);
});
