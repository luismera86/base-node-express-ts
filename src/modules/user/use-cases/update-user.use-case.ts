import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { UpdateUserDto } from "../schemas/user.schema";

const logger = new LoggerService("UpdateUserUseCase");

export const updateUser = async (id: string, data: UpdateUserDto): Promise<any> => {
    try {
        const existing = await prisma.user.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException("User not found");

        const updated = await prisma.user.update({ where: { id }, data });
        return updated;
    } catch (error: unknown) {
        logger.error("Error updating user", (error as Error).message);
        throw error;
    }
};
