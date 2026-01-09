import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

import { BadRequestException } from "../../../exceptions/exceptions";
import { CreateTestDto } from "../schemas/test.schema";

const logger = new LoggerService("CreateTestUseCase");

export const createTest = async (data: CreateTestDto): Promise<any> => {
    try {
        const existingTest = await prisma.test.findFirst({
            where: { name: data.name },
        });
        if (existingTest) throw new BadRequestException("Test already exists");

        const createdTest = await prisma.test.create({ data });
        return createdTest;
    } catch (error: unknown) {
        logger.error("Error creating test", (error as Error).message);
        throw error;
    }
};
