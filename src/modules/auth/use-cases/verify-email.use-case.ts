import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { sha256 } from "../../../common/utils/hash.util";
import { BadRequestException } from "../../../exceptions/exceptions";
import { VerifyEmailDto } from "../schemas/auth.schema";

const logger = new LoggerService("VerifyEmailUseCase");

/**
 * Verifica el correo con el token recibido (de un solo uso) y habilita el login.
 * El lookup es por hash SHA-256: nunca se guarda el token en claro.
 */
export const verifyEmail = async (data: VerifyEmailDto): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({
            where: { verification_token_hash: sha256(data.token), is_active: true, deleted_at: null },
            omit: { verification_token_hash: false, verification_token_expires_at: false },
        });

        if (!user || !user.verification_token_expires_at || user.verification_token_expires_at < new Date()) {
            throw new BadRequestException("errors.INVALID_OR_EXPIRED_TOKEN");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                email_verified: true,
                verification_token_hash: null,
                verification_token_expires_at: null,
            },
        });
    } catch (error: unknown) {
        logger.error("Error verifying email", (error as Error).message);
        throw error;
    }
};
