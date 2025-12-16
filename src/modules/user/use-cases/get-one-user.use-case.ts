import { userRepository } from "../../../common/repositories/repositories";
import { LoggerService } from "../../../common/utils/logger.util";
import { NotFoundException } from "../../../exceptions/exceptions";
import { User } from "../entities/user.entity";

const logger = new LoggerService("GetOneUserUseCase");

export const getOneUser = async (param: string, getBy: string = "id"): Promise<User> => {
    try {
        const user = await userRepository.findOne({ where: { [getBy]: param } });
        if (!user) throw new NotFoundException("User not found");
        return user;
    } catch (error: unknown) {
        logger.error("Error getting user", (error as Error).message);
        throw error;
    }
};
