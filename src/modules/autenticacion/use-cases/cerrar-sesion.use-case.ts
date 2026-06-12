import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("CerrarSesionUseCase");

/** Revoca el refresh token activo del usuario (cierra la sesión). */
export const cerrarSesion = async (idUsuario: string): Promise<{ message: string }> => {
    try {
        await prisma.usuario.update({
            where: { id: idUsuario },
            data: { token_refresco: null, token_refresco_expira_en: null },
        });
        return { message: "Sesión cerrada correctamente" };
    } catch (error: unknown) {
        logger.error("Error al cerrar la sesión", (error as Error).message);
        throw error;
    }
};
