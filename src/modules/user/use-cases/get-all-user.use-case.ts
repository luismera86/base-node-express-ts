import { User } from "../entities/user.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import { userRepository } from "../../../common/repositories/repositories";

export class GetAllUserUseCase {
    private readonly logger: LoggerService = new LoggerService("GetAllUserUseCase");

    async execute(): Promise<User[]> {
        try {
            const users = await userRepository.find();
            return users;
        } catch (error: unknown) {
            this.logger.error("Error getting all users", (error as Error).message);
            throw error;
        }
    }
}
