/**
 * Roles de usuario a nivel código (no se usa enum en Prisma; el modelo guarda String).
 */
export enum Rol {
    ADMINISTRADOR = "admin",
    USUARIO = "user",
}
