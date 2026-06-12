import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashearContrasena } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { CrearUsuarioDto } from "../schemas/usuario.schema";

const logger = new LoggerService("CrearUsuarioUseCase");

export const crearUsuario = async (datos: CrearUsuarioDto): Promise<any> => {
    try {
        const existente = await prisma.usuario.findFirst({ where: { correo: datos.correo } });
        if (existente) throw new ConflictException("El correo ya está en uso");

        const creado = await prisma.usuario.create({
            data: { ...datos, contrasena: await hashearContrasena(datos.contrasena) },
        });
        return creado;
    } catch (error: unknown) {
        logger.error("Error al crear el usuario", (error as Error).message);
        throw error;
    }
};
