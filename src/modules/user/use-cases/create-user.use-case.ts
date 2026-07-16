import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashPassword } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { Role } from "../../../common/enums/role.enum";
import { resolveRoleId } from "../../role/utils/resolve-role.util";
import { CreateUserDto } from "../schemas/user.schema";

const logger = new LoggerService("CreateUserUseCase");

export const createUser = async (data: CreateUserDto): Promise<any> => {
    try {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new ConflictException("errors.EMAIL_IN_USE");

        // El rol viaja por nombre en la API y se resuelve a su id (404 si no existe).
        const { role, ...rest } = data;
        const role_id = await resolveRoleId(role ?? Role.USER);

        const created = await prisma.user.create({
            data: { ...rest, role_id, password: await hashPassword(data.password) },
            include: { role: true },
        });
        return created;
    } catch (error: unknown) {
        logger.error("Error creating user", (error as Error).message);
        throw error;
    }
};
