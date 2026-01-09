import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { UpdateTest2Dto } from "../schemas/test2.schema";

const logger = new LoggerService("UpdateTest2UseCase");

export const updateTest2 = async (id: number, data: UpdateTest2Dto): Promise<any> => {
    try {
        const existingTest2 = await prisma.test2.findFirst({ where: { id } });
        if (!existingTest2) throw new NotFoundException("Test2 not found");

        const updatedTest2 = await prisma.test2.update({
            where: { id },
            data,
        });
        return updatedTest2;
    } catch (error: unknown) {
        logger.error("Error updating test2", (error as Error).message);
        throw error;
    }
};
