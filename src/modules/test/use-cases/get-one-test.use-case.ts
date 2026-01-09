import { testRepository } from "../../../common/repositories/repositories";
import { LoggerService } from "../../../common/utils/logger.util";
import { NotFoundException } from "../../../exceptions/exceptions";
import { Test } from "../entities/test.entity";

const logger = new LoggerService("GetOneTestUseCase");

export const getOneTest = async (param: string, getBy: string = "id"): Promise<Test> => {
    try {
        const test = await testRepository.findOne({ where: { [getBy]: param } });
        if (!test) throw new NotFoundException("Test not found");
        return test;
    } catch (error: unknown) {
        logger.error("Error getting test", (error as Error).message);
        throw error;
    }
};
