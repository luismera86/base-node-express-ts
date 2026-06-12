import { fakerES as faker } from "@faker-js/faker";
import { hashearContrasena } from "../common/utils/hash.util";
import type { AppPrismaClient } from "../config/prisma.config";

const TOTAL = 10;

export const sembrarUsuario = async (prisma: AppPrismaClient): Promise<void> => {
    const contrasenaHasheada = await hashearContrasena("Password123!");

    const usuarios = await Promise.all(
        Array.from({ length: TOTAL }, async (_, i) => ({
            nombre: faker.person.firstName(),
            apellido: faker.person.lastName(),
            correo: faker.internet.email({ provider: `seed${i}${Date.now()}.com` }),
            contrasena: contrasenaHasheada,
            rol: i === 0 ? "admin" : "user",
            activo: true,
        })),
    );

    await prisma.usuario.createMany({ data: usuarios, skipDuplicates: true });
    console.log(`✅ Seed de usuario: ${usuarios.length} registros creados (1 admin + ${TOTAL - 1} usuarios)`);
};
