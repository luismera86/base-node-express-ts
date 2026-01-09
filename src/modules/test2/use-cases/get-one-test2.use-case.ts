import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("GetOneTest2UseCase");

export const getOneTest2 = async (id: number): Promise<any> => {
    try {
        const test2 = await prisma.test2.findFirst({ where: { id } });
        if (!test2) throw new NotFoundException("Test2 not found");
        return test2;
    } catch (error: unknown) {
        logger.error("Error getting test2", (error as Error).message);
        throw error;
    }
};
