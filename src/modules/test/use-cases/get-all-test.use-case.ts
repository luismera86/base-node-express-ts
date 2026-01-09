import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("GetAllTestUseCase");

export const getAllTests = async (): Promise<any[]> => {
    try {
        const tests = await prisma.test.findMany();
        return tests;
    } catch (error: unknown) {
        logger.error("Error getting all tests", (error as Error).message);
        throw error;
    }
};
