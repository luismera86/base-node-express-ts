import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashearContrasena } from "../../../common/utils/hash.util";
import { ConflictException } from "../../../exceptions/exceptions";
import { RegistroDto } from "../schemas/autenticacion.schema";

const logger = new LoggerService("RegistrarUseCase");

export const registrar = async (datos: RegistroDto): Promise<{ id: string; correo: string }> => {
    try {
        const existente = await prisma.usuario.findFirst({ where: { correo: datos.correo } });
        if (existente) throw new ConflictException("El correo ya está en uso");

        const contrasenaHasheada = await hashearContrasena(datos.contrasena);

        const usuario = await prisma.usuario.create({
            data: {
                nombre: datos.nombre,
                apellido: datos.apellido,
                correo: datos.correo,
                contrasena: contrasenaHasheada,
            },
        });

        return { id: usuario.id, correo: usuario.correo };
    } catch (error: unknown) {
        logger.error("Error al registrar el usuario", (error as Error).message);
        throw error;
    }
};
