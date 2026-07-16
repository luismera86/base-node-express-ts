import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { resolveRoleId } from "../../role/utils/resolve-role.util";
import { UpdateUserDto } from "../schemas/user.schema";

const logger = new LoggerService("UpdateUserUseCase");

export const updateUser = async (id: string, data: UpdateUserDto): Promise<any> => {
    try {
        const existing = await prisma.user.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException("errors.USER_NOT_FOUND");

        // El rol viaja por nombre en la API y se resuelve a su id (404 si no existe).
        const { role, ...rest } = data;
        const updateData = role !== undefined ? { ...rest, role_id: await resolveRoleId(role) } : rest;

        const updated = await prisma.user.update({ where: { id }, data: updateData, include: { role: true } });
        return updated;
    } catch (error: unknown) {
        logger.error("Error updating user", (error as Error).message);
        throw error;
    }
};
