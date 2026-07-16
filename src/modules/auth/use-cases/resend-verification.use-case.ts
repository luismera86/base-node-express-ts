import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { generateSecureToken, sha256 } from "../../../common/utils/hash.util";
import { sendMail } from "../../../common/mail/mailer.util";
import { verifyEmailTemplate } from "../../../common/mail/templates/verify-email.template";
import { Lang } from "../../../common/i18n/i18n.util";
import envConfig from "../../../config/env.config";
import { ResendVerificationDto } from "../schemas/auth.schema";

const logger = new LoggerService("ResendVerificationUseCase");

/**
 * Reenvía el correo de verificación generando un token nuevo (el enlace
 * anterior queda invalidado). El controller responde 204 SIEMPRE — exista o no
 * el email, esté o no verificado — para no permitir enumeración de usuarios.
 */
export const resendVerification = async (data: ResendVerificationDto, lang: Lang): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: data.email, is_active: true, deleted_at: null },
        });

        if (!user || user.email_verified) return;

        const raw_token = generateSecureToken();
        const expires_at = new Date(Date.now() + envConfig.EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verification_token_hash: sha256(raw_token),
                verification_token_expires_at: expires_at,
            },
        });

        const link = `${envConfig.FRONTEND_URL}/verify-email?token=${raw_token}`;
        await sendMail(user.email, verifyEmailTemplate(lang, { name: user.first_name, link }));
    } catch (error: unknown) {
        logger.error("Error resending verification email", (error as Error).message);
        throw error;
    }
};
