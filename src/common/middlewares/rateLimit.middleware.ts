import rateLimit from "express-rate-limit";

/**
 * Limita los intentos contra los endpoints de autenticación para mitigar
 * fuerza bruta / credential stuffing / email bombing.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 10, // máx. 10 peticiones por IP en la ventana
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Los tests (unit y e2e) hacen ráfagas de peticiones de auth legítimas.
    skip: () => Boolean(process.env.VITEST),
    message: { statusCode: 429, error: "Too Many Requests", message: "Too many requests, please try again later" },
});
