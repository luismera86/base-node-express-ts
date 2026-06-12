import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compararHash, hashearContrasena } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import {
    crearTokenAcceso,
    generarTokenRefresco,
    extraerIdUsuarioDeTokenRefresco,
} from "../../../common/utils/jwt.util";
import { RefrescarTokenDto } from "../schemas/autenticacion.schema";

const logger = new LoggerService("RefrescarTokenUseCase");

export const refrescarToken = async (datos: RefrescarTokenDto): Promise<{ token: string; token_refresco: string }> => {
    try {
        const idUsuario = extraerIdUsuarioDeTokenRefresco(datos.token_refresco);
        if (!idUsuario) throw new UnauthorizedException("Token de refresco inválido");

        const usuario = await prisma.usuario.findFirst({
            where: { id: idUsuario, activo: true, eliminado_en: null },
            omit: { token_refresco: false, token_refresco_expira_en: false },
        });
        if (!usuario || !usuario.token_refresco || !usuario.token_refresco_expira_en) {
            throw new UnauthorizedException("Token de refresco inválido");
        }

        if (usuario.token_refresco_expira_en < new Date()) {
            throw new UnauthorizedException("El token de refresco ha expirado");
        }

        const valido = await compararHash(datos.token_refresco, usuario.token_refresco);
        if (!valido) throw new UnauthorizedException("Token de refresco inválido");

        // Rotación: se emite un nuevo par y se invalida el refresco anterior.
        const token = await crearTokenAcceso({ id: usuario.id, correo: usuario.correo, rol: usuario.rol });
        const { token: token_refresco, expiraEn } = generarTokenRefresco(usuario.id);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { token_refresco: await hashearContrasena(token_refresco), token_refresco_expira_en: expiraEn },
        });

        return { token, token_refresco };
    } catch (error: unknown) {
        logger.error("Error al refrescar el token", (error as Error).message);
        throw error;
    }
};
