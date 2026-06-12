import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("DeleteUserUseCase");

export const deleteUser = async (id: string): Promise<void> => {
    try {
        const user = await prisma.user.findFirst({ where: { id, deleted_at: null } });
        if (!user) throw new NotFoundException("User not found");

        // Soft delete: se conserva el registro y se invalida la sesión.
        await prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                is_active: false,
                refresh_token: null,
                refresh_token_expires_at: null,
            },
        });
    } catch (error: unknown) {
        logger.error("Error deleting user", (error as Error).message);
        throw error;
    }
};
