import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashPassword } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { RegisterDto } from "../schemas/auth.schema";

const logger = new LoggerService("RegisterUseCase");

export const register = async (data: RegisterDto): Promise<{ id: string; email: string }> => {
    try {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new ConflictException("Email already in use");

        const hashed_password = await hashPassword(data.password);

        const user = await prisma.user.create({
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: hashed_password,
            },
        });

        return { id: user.id, email: user.email };
    } catch (error: unknown) {
        logger.error("Error registering user", (error as Error).message);
        throw error;
    }
};
