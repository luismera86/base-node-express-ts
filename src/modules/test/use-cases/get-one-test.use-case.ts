import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("GetOneTestUseCase");

export const getOneTest = async (id: number): Promise<any> => {
    try {
        const test = await prisma.test.findFirst({ where: { id } });
        if (!test) throw new NotFoundException("Test not found");
        return test;
    } catch (error: unknown) {
        logger.error("Error getting test", (error as Error).message);
        throw error;
    }
};
