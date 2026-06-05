import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compareHash } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { createToken } from "../../../common/utils/jwt.util";
import { LoginDto } from "../schemas/auth.schema";

const logger = new LoggerService("LoginUseCase");

export const login = async (data: LoginDto): Promise<{ token: string }> => {
    try {
        const user = await prisma.user.findFirst({ where: { email: data.email, is_active: true } });
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const valid = await compareHash(data.password, user.password);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        const token = await createToken({ id: user.id, email: user.email, role: user.role });
        return { token };
    } catch (error: unknown) {
        logger.error("Error logging in", (error as Error).message);
        throw error;
    }
};
