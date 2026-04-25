import * as argon2 from "argon2";
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { createToken } from "../../../common/utils/jwt.util";
import { LoginDto } from "../schemas/auth.schema";

const logger = new LoggerService("LoginUseCase");

export const login = async (data: LoginDto): Promise<{ token: string }> => {
    try {
        const user = await prisma.user.findFirst({ where: { email: data.email, is_active: true } });
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const valid = await argon2.verify(user.password, data.password);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        const token = await createToken({ id: user.id, email: user.email, role: user.role });
        return { token };
    } catch (error: unknown) {
        logger.error("Error logging in", (error as Error).message);
        throw error;
    }
};
