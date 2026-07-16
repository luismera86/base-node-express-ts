import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { BadRequestException, ConflictException, NotFoundException } from "../../../exceptions/exceptions";
import { PROTECTED_ROLES } from "../utils/resolve-role.util";

const logger = new LoggerService("DeleteRoleUseCase");

export const deleteRole = async (id: string): Promise<void> => {
    try {
        const role = await prisma.role.findFirst({ where: { id, deleted_at: null } });
        if (!role) throw new NotFoundException("errors.ROLE_NOT_FOUND");

        if (PROTECTED_ROLES.includes(role.name)) {
            throw new BadRequestException("errors.ROLE_PROTECTED");
        }

        // Cuenta usuarios en cualquier estado: un usuario soft-deleted que se
        // restaure no debe quedar apuntando a un rol eliminado.
        const usersWithRole = await prisma.user.count({ where: { role_id: id } });
        if (usersWithRole > 0) throw new ConflictException("errors.ROLE_IN_USE");

        // Soft delete, coherente con el resto de los módulos.
        await prisma.role.update({ where: { id }, data: { deleted_at: new Date() } });
    } catch (error: unknown) {
        logger.error("Error deleting role", (error as Error).message);
        throw error;
    }
};
