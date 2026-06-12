import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compararHash, hashearContrasena } from "../../../common/utils/hash.util";
import { BadRequestException, NotFoundException } from "../../../exceptions/exceptions";
import { RestablecerContrasenaDto } from "../schemas/autenticacion.schema";

const logger = new LoggerService("RestablecerContrasenaUseCase");

export const restablecerContrasena = async (datos: RestablecerContrasenaDto): Promise<{ message: string }> => {
    try {
        const usuario = await prisma.usuario.findFirst({
            where: { correo: datos.correo, activo: true, eliminado_en: null },
            omit: { token_recuperacion: false, token_recuperacion_expira_en: false },
        });
        if (!usuario || !usuario.token_recuperacion || !usuario.token_recuperacion_expira_en) {
            throw new NotFoundException("Token de recuperación inválido o expirado");
        }

        if (usuario.token_recuperacion_expira_en < new Date()) {
            throw new BadRequestException("El token de recuperación ha expirado");
        }

        const valido = await compararHash(datos.token, usuario.token_recuperacion);
        if (!valido) throw new BadRequestException("Token de recuperación inválido");

        const contrasenaHasheada = await hashearContrasena(datos.nueva_contrasena);

        await prisma.usuario.update({
            where: { id: usuario.id },
            // Al restablecer la contraseña se invalidan también las sesiones activas.
            data: {
                contrasena: contrasenaHasheada,
                token_recuperacion: null,
                token_recuperacion_expira_en: null,
                token_refresco: null,
                token_refresco_expira_en: null,
            },
        });

        return { message: "Contraseña actualizada correctamente" };
    } catch (error: unknown) {
        logger.error("Error al restablecer la contraseña", (error as Error).message);
        throw error;
    }
};
