import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { NotFoundException } from "../../../exceptions/exceptions";
import { ActualizarUsuarioDto } from "../schemas/usuario.schema";

const logger = new LoggerService("ActualizarUsuarioUseCase");

export const actualizarUsuario = async (id: string, datos: ActualizarUsuarioDto): Promise<any> => {
    try {
        const existente = await prisma.usuario.findFirst({ where: { id, eliminado_en: null } });
        if (!existente) throw new NotFoundException("Usuario no encontrado");

        const actualizado = await prisma.usuario.update({ where: { id }, data: datos });
        return actualizado;
    } catch (error: unknown) {
        logger.error("Error al actualizar el usuario", (error as Error).message);
        throw error;
    }
};
