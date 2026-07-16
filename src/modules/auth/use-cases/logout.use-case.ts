import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("LogoutUseCase");

/** Revoca el refresh token activo del usuario (cierra la sesión). */
export const logout = async (userId: string): Promise<void> => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { refresh_token_hash: null },
        });
    } catch (error: unknown) {
        logger.error("Error logging out", (error as Error).message);
        throw error;
    }
};
