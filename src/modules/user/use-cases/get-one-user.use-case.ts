import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("GetOneUserUseCase");

export const getOneUser = async (id: string): Promise<any> => {
    try {
        const user = await prisma.user.findFirst({ where: { id } });
        if (!user) throw new NotFoundException("User not found");
        return user;
    } catch (error: unknown) {
        logger.error("Error getting user", (error as Error).message);
        throw error;
    }
};
