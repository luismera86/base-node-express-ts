import { randomUUID } from "crypto";
import { LoggerService } from "../../../common/utils/logger.util";
import { prisma } from "../../../config/prisma.config";
import { hashearContrasena } from "../../../common/utils/hash.util";
import { RecuperarContrasenaDto } from "../schemas/autenticacion.schema";

const logger = new LoggerService("RecuperarContrasenaUseCase");
const MINUTOS_VIDA_TOKEN = 30;

export const recuperarContrasena = async (datos: RecuperarContrasenaDto): Promise<{ message: string }> => {
    try {
        const usuario = await prisma.usuario.findFirst({ where: { correo: datos.correo, activo: true } });

        // Respuesta genérica para no revelar si el correo existe
        if (!usuario) return { message: "Si el correo existe, se ha enviado un enlace de recuperación" };

        const tokenPlano = randomUUID();
        const tokenHasheado = await hashearContrasena(tokenPlano);
        const expiraEn = new Date(Date.now() + MINUTOS_VIDA_TOKEN * 60 * 1000);

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { token_recuperacion: tokenHasheado, token_recuperacion_expira_en: expiraEn },
        });

        // TODO: enviar tokenPlano por correo al usuario (NUNCA loguear el token en claro).

        return { message: "Si el correo existe, se ha enviado un enlace de recuperación" };
    } catch (error: unknown) {
        logger.error("Error al solicitar la recuperación de contraseña", (error as Error).message);
        throw error;
    }
};
