import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { BadRequestException, ConflictException, NotFoundException } from "../../../exceptions/exceptions";
import { UpdateRoleDto } from "../schemas/role.schema";
import { PROTECTED_ROLES } from "../utils/resolve-role.util";

const logger = new LoggerService("UpdateRoleUseCase");

export const updateRole = async (id: string, data: UpdateRoleDto) => {
    try {
        const existing = await prisma.role.findFirst({ where: { id, deleted_at: null } });
        if (!existing) throw new NotFoundException("errors.ROLE_NOT_FOUND");

        const renaming = data.name !== undefined && data.name !== existing.name;

        // Los roles base (admin, user) no se renombran: requireRole compara por nombre.
        if (renaming && PROTECTED_ROLES.includes(existing.name)) {
            throw new BadRequestException("errors.ROLE_PROTECTED");
        }

        if (renaming) {
            const nameTaken = await prisma.role.findFirst({ where: { name: data.name, NOT: { id } } });
            if (nameTaken) throw new ConflictException("errors.ROLE_NAME_IN_USE");
        }

        return await prisma.role.update({ where: { id }, data });
    } catch (error: unknown) {
        logger.error("Error updating role", (error as Error).message);
        throw error;
    }
};
