import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { generateSecureToken, sha256 } from "../../../common/utils/hash.util";
import { sendMail } from "../../mail/utils/mailer.util";
import { resetPasswordTemplate } from "../../mail/templates/reset-password.template";
import { Lang } from "../../../common/i18n/i18n.util";
import envConfig from "../../../config/env.config";
import { ForgotPasswordDto } from "../schemas/auth.schema";

const logger = new LoggerService("ForgotPasswordUseCase");

/**
 * El controller responde 204 SIEMPRE — exista o no el email — para no permitir
 * enumeración de usuarios. Si existe, se genera un token aleatorio de 256 bits,
 * se guarda solo su hash SHA-256 con vencimiento y se envía el enlace por correo.
 */
export const forgotPassword = async (data: ForgotPasswordDto, lang: Lang): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: data.email, is_active: true, deleted_at: null },
        });
        if (!user) return;

        const raw_token = generateSecureToken();
        const expires_at = new Date(Date.now() + envConfig.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { reset_token_hash: sha256(raw_token), reset_token_expires_at: expires_at },
        });

        const link = `${envConfig.FRONTEND_URL}/reset-password?token=${raw_token}`;
        await sendMail(
            user.email,
            resetPasswordTemplate(lang, {
                name: user.first_name,
                link,
                ttl: envConfig.PASSWORD_RESET_TTL_MINUTES,
            }),
        );
    } catch (error: unknown) {
        logger.error("Error requesting password reset", (error as Error).message);
        throw error;
    }
};
