import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";

const logger = new LoggerService("ObtenerTodosUsuariosUseCase");

export const obtenerTodosUsuarios = async (): Promise<any[]> => {
    try {
        const usuarios = await prisma.usuario.findMany({ where: { eliminado_en: null } });
        return usuarios;
    } catch (error: unknown) {
        logger.error("Error al obtener todos los usuarios", (error as Error).message);
        throw error;
    }
};
