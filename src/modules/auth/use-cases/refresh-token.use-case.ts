import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compareHash, hashPassword } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { createAccessToken, generateRefreshToken, parseRefreshTokenUserId } from "../../../common/utils/jwt.util";
import { RefreshTokenDto } from "../schemas/auth.schema";

const logger = new LoggerService("RefreshTokenUseCase");

export const refreshToken = async (data: RefreshTokenDto): Promise<{ token: string; refresh_token: string }> => {
    try {
        const userId = parseRefreshTokenUserId(data.refresh_token);
        if (!userId) throw new UnauthorizedException("Invalid refresh token");

        const user = await prisma.user.findFirst({
            where: { id: userId, is_active: true, deleted_at: null },
            omit: { refresh_token: false, refresh_token_expires_at: false },
        });
        if (!user || !user.refresh_token || !user.refresh_token_expires_at) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (user.refresh_token_expires_at < new Date()) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        const valid = await compareHash(data.refresh_token, user.refresh_token);
        if (!valid) throw new UnauthorizedException("Invalid refresh token");

        // Rotación: se emite un nuevo par y se invalida el refresh anterior.
        const token = await createAccessToken({ id: user.id, email: user.email, role: user.role });
        const { token: refresh_token, expiresAt } = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: await hashPassword(refresh_token), refresh_token_expires_at: expiresAt },
        });

        return { token, refresh_token };
    } catch (error: unknown) {
        logger.error("Error refreshing token", (error as Error).message);
        throw error;
    }
};
