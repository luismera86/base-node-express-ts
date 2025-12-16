import { User } from "../entities/user.entity";
import { LoggerService } from "../../../common/utils/logger.util";
import { userRepository } from "../../../common/repositories/repositories";

const logger = new LoggerService("GetAllUserUseCase");

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const users = await userRepository.find();
        return users;
    } catch (error: unknown) {
        logger.error("Error getting all users", (error as Error).message);
        throw error;
    }
};
