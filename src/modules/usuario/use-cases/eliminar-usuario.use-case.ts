import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("EliminarUsuarioUseCase");

export const eliminarUsuario = async (id: string): Promise<void> => {
    try {
        const usuario = await prisma.usuario.findFirst({ where: { id, eliminado_en: null } });
        if (!usuario) throw new NotFoundException("Usuario no encontrado");

        // Soft delete: se conserva el registro y se invalida la sesión.
        await prisma.usuario.update({
            where: { id },
            data: {
                eliminado_en: new Date(),
                activo: false,
                token_refresco: null,
                token_refresco_expira_en: null,
            },
        });
    } catch (error: unknown) {
        logger.error("Error al eliminar el usuario", (error as Error).message);
        throw error;
    }
};
