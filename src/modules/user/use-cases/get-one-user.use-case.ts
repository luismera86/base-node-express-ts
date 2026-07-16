import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("GetOneUserUseCase");

export const getOneUser = async (id: string): Promise<any> => {
    try {
        const user = await prisma.user.findFirst({ where: { id, deleted_at: null }, include: { role: true } });
        if (!user) throw new NotFoundException("errors.USER_NOT_FOUND");
        return user;
    } catch (error: unknown) {
        logger.error("Error getting user", (error as Error).message);
        throw error;
    }
};
