import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("LogoutUseCase");

/** Revoca el refresh token activo del usuario (cierra la sesión). */
export const logout = async (userId: string): Promise<{ message: string }> => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { refresh_token: null, refresh_token_expires_at: null },
        });
        return { message: "Logged out successfully" };
    } catch (error: unknown) {
        logger.error("Error logging out", (error as Error).message);
        throw error;
    }
};
