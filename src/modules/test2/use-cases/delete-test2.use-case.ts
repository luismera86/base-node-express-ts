import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("DeleteTest2UseCase");

export const deleteTest2 = async (id: number): Promise<void> => {
    try {
        const test2 = await prisma.test2.findFirst({ where: { id } });
        if (!test2) throw new NotFoundException("Test2 not found");

        await prisma.test2.delete({ where: { id } });
    } catch (error: unknown) {
        logger.error("Error deleting test2", (error as Error).message);
        throw error;
    }
};
