import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compareHash, hashPassword } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { createAccessToken, generateRefreshToken } from "../../../common/utils/jwt.util";
import { LoginDto } from "../schemas/auth.schema";

const logger = new LoggerService("LoginUseCase");

export const login = async (data: LoginDto): Promise<{ token: string; refresh_token: string }> => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: data.email, is_active: true, deleted_at: null },
            omit: { password: false },
        });
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const valid = await compareHash(data.password, user.password);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        const token = await createAccessToken({ id: user.id, email: user.email, role: user.role });
        const { token: refresh_token, expiresAt } = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: await hashPassword(refresh_token), refresh_token_expires_at: expiresAt },
        });

        return { token, refresh_token };
    } catch (error: unknown) {
        logger.error("Error logging in", (error as Error).message);
        throw error;
    }
};
