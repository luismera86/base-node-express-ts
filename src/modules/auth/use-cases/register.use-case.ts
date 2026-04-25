import * as argon2 from "argon2";
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { ConflictException } from "../../../exceptions/exceptions";
import { RegisterDto } from "../schemas/auth.schema";

const logger = new LoggerService("RegisterUseCase");

export const register = async (data: RegisterDto): Promise<{ id: string; email: string }> => {
    try {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new ConflictException("Email already in use");

        const hashed_password = await argon2.hash(data.password, { type: argon2.argon2id });

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
