import { BadRequestException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../schemas/user.schema";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

export class CreateUserUseCase {
    private readonly logger: LoggerService = new LoggerService("CreateUserUseCase");

    async execute(data: CreateUserDto): Promise<User> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingUser = await queryRunner.manager.findOne(User, { where: { email: data.email } });
            if (existingUser) throw new BadRequestException("User already exists");

            const createdUser = queryRunner.manager.create(User, data);
            await queryRunner.manager.save(createdUser);
            await queryRunner.commitTransaction();
            return createdUser;
        } catch (error: any) {
            this.logger.error("Error creating user", error.message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
