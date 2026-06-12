import rateLimit from "express-rate-limit";

/**
 * Limita los intentos contra los endpoints de autenticación para mitigar
 * fuerza bruta / credential stuffing / email bombing.
 */
export const limitadorAutenticacion = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 10, // máx. 10 peticiones por IP en la ventana
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { status: "error", statusCode: 429, message: "Demasiadas peticiones, intenta nuevamente más tarde" },
});
