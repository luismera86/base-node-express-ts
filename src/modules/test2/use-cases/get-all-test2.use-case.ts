import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("GetAllTest2UseCase");

export const getAllTest2s = async (): Promise<any[]> => {
    try {
        const test2s = await prisma.test2.findMany();
        return test2s;
    } catch (error: unknown) {
        logger.error("Error getting all test2s", (error as Error).message);
        throw error;
    }
};
