import { NotFoundException } from "../../../exceptions/exceptions";
import { Test } from "../entities/test.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("DeleteTestUseCase");

export const deleteTest = async (id: number): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const test = await queryRunner.manager.findOne(Test, { where: { id } });
        if (!test) throw new NotFoundException("Test not found");

        await queryRunner.manager.remove(test);
        await queryRunner.commitTransaction();
    } catch (error: unknown) {
        logger.error("Error deleting test", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
