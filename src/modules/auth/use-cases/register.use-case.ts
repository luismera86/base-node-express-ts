import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { generateSecureToken, hashPassword, sha256 } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { sendMail } from "../../../common/mail/mailer.util";
import { verifyEmailTemplate } from "../../../common/mail/templates/verify-email.template";
import { Lang } from "../../../common/i18n/i18n.util";
import envConfig from "../../../config/env.config";
import { RegisterDto } from "../schemas/auth.schema";

const logger = new LoggerService("RegisterUseCase");

/**
 * Crea el usuario y envía el correo de verificación. NO inicia sesión:
 * el login queda bloqueado (403) hasta verificar el email.
 */
export const register = async (data: RegisterDto, lang: Lang): Promise<{ id: string; email: string }> => {
    try {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new ConflictException("errors.EMAIL_IN_USE");

        const hashed_password = await hashPassword(data.password);

        // Del token de verificación solo se persiste su hash SHA-256; el token
        // en claro viaja únicamente en el enlace del correo.
        const raw_token = generateSecureToken();
        const expires_at = new Date(Date.now() + envConfig.EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: hashed_password,
                verification_token_hash: sha256(raw_token),
                verification_token_expires_at: expires_at,
            },
        });

        const link = `${envConfig.FRONTEND_URL}/verify-email?token=${raw_token}`;
        await sendMail(user.email, verifyEmailTemplate(lang, { name: user.first_name, link }));

        return { id: user.id, email: user.email };
    } catch (error: unknown) {
        logger.error("Error registering user", (error as Error).message);
        throw error;
    }
};
