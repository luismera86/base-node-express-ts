import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("DeleteTestUseCase");

export const deleteTest = async (id: number): Promise<void> => {
    try {
        const test = await prisma.test.findFirst({ where: { id } });
        if (!test) throw new NotFoundException("Test not found");

        await prisma.test.delete({ where: { id } });
    } catch (error: unknown) {
        logger.error("Error deleting test", (error as Error).message);
        throw error;
    }
};
