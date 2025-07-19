import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

export class GetOneUserUseCase {
    private readonly logger: LoggerService = new LoggerService("GetOneUserUseCase");

    async execute(param: string, getBy: string = "id"): Promise<User> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(User, { where: { [getBy]: param } });
            if (!user) throw new NotFoundException("User not found");

            await queryRunner.commitTransaction();
            return user;
        } catch (error: any) {
            this.logger.error("Error getting user", error.message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
