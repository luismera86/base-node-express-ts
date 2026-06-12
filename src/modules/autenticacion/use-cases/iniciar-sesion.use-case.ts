import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { compararHash, hashearContrasena } from "../../../common/utils/hash.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";
import { crearTokenAcceso, generarTokenRefresco } from "../../../common/utils/jwt.util";
import { IniciarSesionDto } from "../schemas/autenticacion.schema";

const logger = new LoggerService("IniciarSesionUseCase");

export const iniciarSesion = async (datos: IniciarSesionDto): Promise<{ token: string; token_refresco: string }> => {
    try {
        const usuario = await prisma.usuario.findFirst({
            where: { correo: datos.correo, activo: true, eliminado_en: null },
            omit: { contrasena: false },
        });
        if (!usuario) throw new UnauthorizedException("Credenciales inválidas");

        const valido = await compararHash(datos.contrasena, usuario.contrasena);
        if (!valido) throw new UnauthorizedException("Credenciales inválidas");

        const token = await crearTokenAcceso({ id: usuario.id, correo: usuario.correo, rol: usuario.rol });
        const { token: token_refresco, expiraEn } = generarTokenRefresco(usuario.id);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { token_refresco: await hashearContrasena(token_refresco), token_refresco_expira_en: expiraEn },
        });

        return { token, token_refresco };
    } catch (error: unknown) {
        logger.error("Error al iniciar sesión", (error as Error).message);
        throw error;
    }
};
