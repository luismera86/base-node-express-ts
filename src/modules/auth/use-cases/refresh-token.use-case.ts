import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { sha256 } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.util";
import { AuthTokens } from "./login.use-case";

const logger = new LoggerService("RefreshTokenUseCase");

/**
 * Rotación con detección de reuso: cada refresh invalida el token anterior.
 * Si se presenta un refresh ya rotado (firma válida pero hash distinto al
 * guardado), se asume robo y se revoca la sesión completa — el refresh
 * vigente también deja de servir.
 */
export const refreshToken = async (rawToken: string): Promise<AuthTokens> => {
    try {
        const { userId } = await verifyRefreshToken(rawToken);

        const user = await prisma.user.findFirst({
            where: { id: userId, is_active: true, deleted_at: null },
            omit: { refresh_token_hash: false },
            include: { role: true },
        });
        if (!user || !user.refresh_token_hash) {
            throw new UnauthorizedException("errors.INVALID_OR_EXPIRED_TOKEN");
        }

        if (sha256(rawToken) !== user.refresh_token_hash) {
            // Firma válida pero hash distinto al guardado → token ya rotado en
            // manos de alguien: se revoca la sesión completa.
            await prisma.user.update({ where: { id: user.id }, data: { refresh_token_hash: null } });
            logger.warn(`Reuso de refresh token detectado para el usuario ${user.id}: sesión revocada`);
            throw new UnauthorizedException("errors.INVALID_OR_EXPIRED_TOKEN");
        }

        // Rotación: se emite un nuevo par y se invalida el refresh anterior.
        const accessToken = await createAccessToken({ id: user.id, email: user.email, role: user.role.name });
        const { token: newRefreshToken } = await createRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token_hash: sha256(newRefreshToken) },
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: { id: user.id, email: user.email, role: user.role.name },
        };
    } catch (error: unknown) {
        logger.error("Error refreshing token", (error as Error).message);
        throw error;
    }
};
