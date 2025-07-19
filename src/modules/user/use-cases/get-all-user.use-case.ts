import { User } from "../entities/user.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import AppDataSource from "../../../config/datasource.config";

export class GetAllUserUseCase {
    private readonly logger: LoggerService = new LoggerService("GetAllUserUseCase");

    async execute(): Promise<User[]> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const users = await queryRunner.manager.find(User);
            await queryRunner.commitTransaction();
            return users;
        } catch (error: any) {
            this.logger.error("Error getting all users", error.message);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
