import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { ConflictException } from "../../../exceptions/exceptions";
import { CreateRoleDto } from "../schemas/role.schema";

const logger = new LoggerService("CreateRoleUseCase");

export const createRole = async (data: CreateRoleDto) => {
    try {
        // Sin filtro de deleted_at: el unique de la DB incluye los soft-deleted.
        const existing = await prisma.role.findFirst({ where: { name: data.name } });
        if (existing) throw new ConflictException("errors.ROLE_NAME_IN_USE");

        return await prisma.role.create({ data });
    } catch (error: unknown) {
        logger.error("Error creating role", (error as Error).message);
        throw error;
    }
};
