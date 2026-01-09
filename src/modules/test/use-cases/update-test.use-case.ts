import { NotFoundException } from "../../../exceptions/exceptions";
import { Test } from "../entities/test.entity";
import { UpdateTestDto } from "../schemas/test.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("UpdateTestUseCase");

export const updateTest = async (id: number, data: UpdateTestDto): Promise<Test> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        await queryRunner.manager.update(Test, id, data);
        const updatedTest = await queryRunner.manager.findOne(Test, { where: { id } });
        if (!updatedTest) throw new NotFoundException("Test not found");

        await queryRunner.commitTransaction();
        return updatedTest;
    } catch (error: unknown) {
        logger.error("Error updating test", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
