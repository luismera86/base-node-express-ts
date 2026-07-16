import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { Role } from "../../../common/enums/role.enum";

/** Roles base del sistema: requireRole compara contra estos nombres. No se renombran ni eliminan. */
export const PROTECTED_ROLES: string[] = Object.values(Role);

/**
 * Resuelve el id de un rol por nombre (para asignarlo a un usuario).
 * Lanza 404 con clave i18n si no existe o está soft-deleted.
 */
export const resolveRoleId = async (name: string): Promise<string> => {
    const role = await prisma.role.findFirst({ where: { name, deleted_at: null } });
    if (!role) throw new NotFoundException("errors.ROLE_NOT_FOUND");
    return role.id;
};
