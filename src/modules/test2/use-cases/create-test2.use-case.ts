import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { BadRequestException } from "../../../exceptions/exceptions";
import { CreateTest2Dto } from "../schemas/test2.schema";

const logger = new LoggerService("CreateTest2UseCase");

export const createTest2 = async (data: CreateTest2Dto): Promise<any> => {
    try {
        const existingTest2 = await prisma.test2.findFirst({ where: { name: data.name } });
        if (existingTest2) throw new BadRequestException("Test2 already exists");

        const createdTest2 = await prisma.test2.create({ data });
        return createdTest2;
    } catch (error: unknown) {
        logger.error("Error creating test2", (error as Error).message);
        throw error;
    }
};
