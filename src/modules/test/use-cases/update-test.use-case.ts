import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { UpdateTestDto } from "../schemas/test.schema";

const logger = new LoggerService("UpdateTestUseCase");

export const updateTest = async (id: number, data: UpdateTestDto): Promise<any> => {
    try {
        const existingTest = await prisma.test.findFirst({ where: { id } });
        if (!existingTest) throw new NotFoundException("Test not found");

        const updatedTest = await prisma.test.update({
            where: { id },
            data,
        });
        return updatedTest;
    } catch (error: unknown) {
        logger.error("Error updating test", (error as Error).message);
        throw error;
    }
};
