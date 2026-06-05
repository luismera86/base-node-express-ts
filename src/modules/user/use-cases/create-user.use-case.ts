import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashPassword } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { CreateUserDto } from "../schemas/user.schema";

const logger = new LoggerService("CreateUserUseCase");

export const createUser = async (data: CreateUserDto): Promise<any> => {
    try {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new ConflictException("Email already in use");

        const created = await prisma.user.create({
            data: { ...data, password: await hashPassword(data.password) },
        });
        return created;
    } catch (error: unknown) {
        logger.error("Error creating user", (error as Error).message);
        throw error;
    }
};
