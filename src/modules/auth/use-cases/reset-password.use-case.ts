import * as argon2 from "argon2";
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { BadRequestException, NotFoundException } from "../../../exceptions/exceptions";
import { ResetPasswordDto } from "../schemas/auth.schema";

const logger = new LoggerService("ResetPasswordUseCase");

export const resetPassword = async (data: ResetPasswordDto): Promise<{ message: string }> => {
    try {
        const user = await prisma.user.findFirst({ where: { email: data.email, is_active: true } });
        if (!user || !user.reset_token || !user.reset_token_expires_at) {
            throw new NotFoundException("Invalid or expired reset token");
        }

        if (user.reset_token_expires_at < new Date()) {
            throw new BadRequestException("Reset token has expired");
        }

        const valid = await argon2.verify(user.reset_token, data.token);
        if (!valid) throw new BadRequestException("Invalid reset token");

        const hashed_password = await argon2.hash(data.new_password, { type: argon2.argon2id });

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed_password, reset_token: null, reset_token_expires_at: null },
        });

        return { message: "Password updated successfully" };
    } catch (error: unknown) {
        logger.error("Error resetting password", (error as Error).message);
        throw error;
    }
};
