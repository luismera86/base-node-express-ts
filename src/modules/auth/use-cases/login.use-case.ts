import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compareHash, sha256 } from "../../../common/utils/hash.util";
import { ForbiddenException, UnauthorizedException } from "../../../exceptions/exceptions";
import { createAccessToken, createRefreshToken } from "../../../common/utils/jwt.util";
import { LoginDto } from "../schemas/auth.schema";

const logger = new LoggerService("LoginUseCase");

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: string };
}

/**
 * Mismo 401 exista o no el email (evita enumeración de usuarios).
 * El chequeo de verificación de email corre DESPUÉS de validar la contraseña,
 * así no revela nada a terceros.
 */
export const login = async (data: LoginDto): Promise<AuthTokens> => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: data.email, is_active: true, deleted_at: null },
            omit: { password: false },
        });
        if (!user) throw new UnauthorizedException("errors.INVALID_CREDENTIALS");

        const valid = await compareHash(data.password, user.password);
        if (!valid) throw new UnauthorizedException("errors.INVALID_CREDENTIALS");

        if (!user.email_verified) throw new ForbiddenException("errors.EMAIL_NOT_VERIFIED");

        const accessToken = await createAccessToken({ id: user.id, email: user.email, role: user.role });
        const { token: refreshToken } = await createRefreshToken(user.id);

        // Solo se persiste el hash SHA-256 del refresh, nunca el token en claro.
        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token_hash: sha256(refreshToken) },
        });

        return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
    } catch (error: unknown) {
        logger.error("Error logging in", (error as Error).message);
        throw error;
    }
};
