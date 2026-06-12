/**
 * Roles de usuario a nivel código (no se usa enum en Prisma; el modelo guarda String).
 */
export enum Role {
    ADMIN = "admin",
    USER = "user",
}
