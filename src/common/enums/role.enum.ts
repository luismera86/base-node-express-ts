/**
 * Nombres de los roles BASE del sistema: existen en la tabla `roles` (sembrados
 * por migración/seed), la autorización (requireRole, ownership) compara contra
 * ellos y no pueden renombrarse ni eliminarse por API. Los roles adicionales
 * creados por API viven solo en la tabla.
 */
export enum Role {
    ADMIN = "admin",
    USER = "user",
}
