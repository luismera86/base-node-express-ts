import { Role } from "../common/enums/role.enum";
import type { AppPrismaClient } from "../config/prisma.config";

/**
 * Roles base del sistema (los mismos del enum Role). Upsert: la migración
 * roles-table ya los inserta; este seed garantiza que existan tras un reset.
 */
const BASE_ROLES: { name: string; description: string }[] = [
    { name: Role.ADMIN, description: "Acceso total a la administración" },
    { name: Role.USER, description: "Usuario estándar" },
];

export const seedRole = async (prisma: AppPrismaClient): Promise<void> => {
    for (const role of BASE_ROLES) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: { description: role.description, deleted_at: null },
            create: role,
        });
    }
    console.log(`✅ Seed de role: ${BASE_ROLES.map((r) => r.name).join(", ")}`);
};
