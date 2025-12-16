import { BadRequestException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../schemas/user.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

const logger = new LoggerService("CreateUserUseCase");

export const createUser = async (data: CreateUserDto): Promise<User> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const existingUser = await queryRunner.manager.findOne(User, { where: { name: data.name } });
        if (existingUser) throw new BadRequestException("User already exists");

        const createdUser = queryRunner.manager.create(User, data);
        await queryRunner.manager.save(createdUser);
        await queryRunner.commitTransaction();
        return createdUser;
    } catch (error: unknown) {
        logger.error("Error creating user", (error as Error).message);
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
