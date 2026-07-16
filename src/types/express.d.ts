interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
}

declare namespace Express {
    interface Request {
        user?: AuthenticatedUser;
        /** Idioma resuelto desde Accept-Language (default: es). */
        lang?: "es" | "en";
        /** x-request-id asignado por el middleware de logging (pino-http). */
        id?: string | number | object;
    }
}
