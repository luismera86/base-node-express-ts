import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "../schemas/user.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("UpdateUserUseCase");

export const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        await queryRunner.manager.update(User, id, data);
        const updatedUser = await queryRunner.manager.findOne(User, { where: { id } });
        if (!updatedUser) throw new NotFoundException("User not found");

        await queryRunner.commitTransaction();
        return updatedUser;
    } catch (error: unknown) {
        logger.error("Error updating user", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
