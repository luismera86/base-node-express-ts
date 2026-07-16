export const es = {
    errors: {
        INVALID_CREDENTIALS: "Credenciales inválidas",
        EMAIL_NOT_VERIFIED: "Debes verificar tu correo electrónico antes de iniciar sesión",
        EMAIL_IN_USE: "El email ya está en uso",
        INVALID_OR_EXPIRED_TOKEN: "Token inválido o expirado",
        TOKEN_NOT_PROVIDED: "Token no proporcionado",
        USER_NOT_FOUND: "Usuario no encontrado",
        USER_INACTIVE: "Usuario no encontrado o inactivo",
        FORBIDDEN: "No tienes permisos para acceder a este recurso",
        NOT_FOUND: "Recurso no encontrado",
        PATH_NOT_FOUND: "Ruta no encontrada",
        DUPLICATE_RESOURCE: "Ya existe un recurso con esos datos",
        RELATED_RESOURCE_CONFLICT: "El recurso está vinculado a otros registros",
        INVALID_ID: "Identificador inválido",
        VALIDATION_ERROR: "Error de validación",
        INTERNAL_SERVER_ERROR: "Error interno del servidor",
        TOO_MANY_REQUESTS: "Demasiadas peticiones, intenta de nuevo más tarde",
        WEAK_PASSWORD:
            "La contraseña debe tener entre 8 y 128 caracteres, con al menos una minúscula, una mayúscula, un número y un carácter especial",
        SERVICE_UNAVAILABLE: "Servicio no disponible",
    },
    mail: {
        VERIFY_SUBJECT: "Verifica tu correo electrónico",
        VERIFY_TITLE: "Confirma tu cuenta",
        VERIFY_BODY: "Gracias por registrarte, {name}. Haz clic en el botón para verificar tu correo electrónico.",
        VERIFY_CTA: "Verificar correo",
        RESET_SUBJECT: "Recuperación de contraseña",
        RESET_TITLE: "Restablece tu contraseña",
        RESET_BODY:
            "Hola {name}. Recibimos una solicitud para restablecer tu contraseña. El enlace vence en {ttl} minutos. Si no fuiste tú, ignora este correo.",
        RESET_CTA: "Restablecer contraseña",
        FALLBACK: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    },
};

export type TranslationDict = typeof es;
