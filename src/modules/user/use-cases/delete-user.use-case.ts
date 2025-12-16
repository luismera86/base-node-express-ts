import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("DeleteUserUseCase");

export const deleteUser = async (id: number): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const user = await queryRunner.manager.findOne(User, { where: { id } });
        if (!user) throw new NotFoundException("User not found");

        await queryRunner.manager.remove(user);
        await queryRunner.commitTransaction();
    } catch (error: unknown) {
        logger.error("Error deleting user", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
