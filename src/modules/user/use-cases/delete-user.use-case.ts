import { userRepository } from "../../../common/repositories/repositories";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("DeleteUserUseCase");

export const deleteUser = async (id: number): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const user = await userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");

        await userRepository.remove(user);
        await queryRunner.commitTransaction();
    } catch (error: unknown) {
        logger.error("Error deleting user", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
