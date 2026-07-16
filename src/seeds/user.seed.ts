import { fakerES as faker } from "@faker-js/faker";
import { hashPassword } from "../common/utils/hash.util";
import { Role } from "../common/enums/role.enum";
import type { AppPrismaClient } from "../config/prisma.config";

const TOTAL = 10;

export const seedUser = async (prisma: AppPrismaClient): Promise<void> => {
    const hashed_password = await hashPassword("Password123!");

    // role.seed corre antes: los roles base ya existen y se asignan por role_id.
    const roles = await prisma.role.findMany({ where: { name: { in: [Role.ADMIN, Role.USER] } } });
    const roleIdByName = Object.fromEntries(roles.map((r) => [r.name, r.id]));

    const users = await Promise.all(
        Array.from({ length: TOTAL }, async (_, i) => ({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            // El primer usuario es un admin con email fijo para poder loguearse tras el seed.
            email: i === 0 ? "admin@example.com" : faker.internet.email({ provider: `seed${i}${Date.now()}.com` }),
            password: hashed_password,
            role_id: roleIdByName[i === 0 ? Role.ADMIN : Role.USER],
            is_active: true,
            // Los usuarios sembrados nacen verificados (no pueden pasar por el flujo de email).
            email_verified: true,
        })),
    );

    await prisma.user.createMany({ data: users, skipDuplicates: true });
    console.log(
        `✅ Seed de user: ${users.length} registros creados (admin@example.com / Password123! + ${TOTAL - 1} usuarios)`,
    );
};
