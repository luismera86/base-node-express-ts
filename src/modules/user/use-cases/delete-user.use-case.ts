import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("DeleteUserUseCase");

export const deleteUser = async (id: string): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({ where: { id } });
        if (!user) throw new NotFoundException("User not found");

        await prisma.user.delete({ where: { id } });
    } catch (error: unknown) {
        logger.error("Error deleting user", (error as Error).message);
        throw error;
    }
};
