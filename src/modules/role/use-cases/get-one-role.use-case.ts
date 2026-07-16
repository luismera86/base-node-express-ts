import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("GetOneRoleUseCase");

export const getOneRole = async (id: string) => {
    try {
        const role = await prisma.role.findFirst({
            where: { id, deleted_at: null },
            include: { _count: { select: { users: true } } },
        });
        if (!role) throw new NotFoundException("errors.ROLE_NOT_FOUND");
        return role;
    } catch (error: unknown) {
        logger.error("Error getting role", (error as Error).message);
        throw error;
    }
};
