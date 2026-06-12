import { randomUUID } from "crypto";
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashPassword } from "../../../common/utils/hash.util";
import { ForgotPasswordDto } from "../schemas/auth.schema";

const logger = new LoggerService("ForgotPasswordUseCase");
const TOKEN_TTL_MINUTES = 30;

export const forgotPassword = async (data: ForgotPasswordDto): Promise<{ message: string }> => {
    try {
        const user = await prisma.user.findFirst({ where: { email: data.email, is_active: true } });

        // Respuesta genérica para no revelar si el email existe
        if (!user) return { message: "If the email exists, a reset link has been sent" };

        const raw_token = randomUUID();
        const hashed_token = await hashPassword(raw_token);
        const expires_at = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { reset_token: hashed_token, reset_token_expires_at: expires_at },
        });

        // TODO: enviar raw_token por email al usuario (NUNCA loguear el token en claro).

        return { message: "If the email exists, a reset link has been sent" };
    } catch (error: unknown) {
        logger.error("Error requesting password reset", (error as Error).message);
        throw error;
    }
};
