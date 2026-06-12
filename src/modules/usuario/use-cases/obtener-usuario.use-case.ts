import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";

const logger = new LoggerService("ObtenerUsuarioUseCase");

export const obtenerUsuario = async (id: string): Promise<any> => {
    try {
        const usuario = await prisma.usuario.findFirst({ where: { id, eliminado_en: null } });
        if (!usuario) throw new NotFoundException("Usuario no encontrado");
        return usuario;
    } catch (error: unknown) {
        logger.error("Error al obtener el usuario", (error as Error).message);
        throw error;
    }
};
