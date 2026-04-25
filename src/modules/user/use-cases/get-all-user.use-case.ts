import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("GetAllUserUseCase");

export const getAllUsers = async (): Promise<any[]> => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error: unknown) {
        logger.error("Error getting all users", (error as Error).message);
        throw error;
    }
};
