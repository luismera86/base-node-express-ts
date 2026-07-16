import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashPassword, sha256 } from "../../../common/utils/hash.util";
import { BadRequestException } from "../../../exceptions/exceptions";
import { ResetPasswordDto } from "../schemas/auth.schema";

const logger = new LoggerService("ResetPasswordUseCase");

/**
 * Valida el token por hash SHA-256 y vencimiento, guarda la nueva contraseña,
 * consume el token (un solo uso) y revoca todas las sesiones activas: si la
 * cuenta estaba comprometida, el atacante queda fuera.
 */
export const resetPassword = async (data: ResetPasswordDto): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({
            where: { reset_token_hash: sha256(data.token), is_active: true, deleted_at: null },
            omit: { reset_token_hash: false, reset_token_expires_at: false },
        });

        if (!user || !user.reset_token_expires_at || user.reset_token_expires_at < new Date()) {
            throw new BadRequestException("errors.INVALID_OR_EXPIRED_TOKEN");
        }

        const hashed_password = await hashPassword(data.new_password);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed_password,
                reset_token_hash: null,
                reset_token_expires_at: null,
                // Al resetear la contraseña se invalidan también las sesiones activas.
                refresh_token_hash: null,
            },
        });
    } catch (error: unknown) {
        logger.error("Error resetting password", (error as Error).message);
        throw error;
    }
};
