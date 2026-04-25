import { PrismaClient } from "@prisma/client";
import { fakerES as faker } from "@faker-js/faker";
import * as argon2 from "argon2";

const TOTAL = 10;

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
    const hashed_password = await argon2.hash("Password123!", { type: argon2.argon2id });

    const users = await Promise.all(
        Array.from({ length: TOTAL }, async (_, i) => ({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email({ provider: `seed${i}${Date.now()}.com` }),
            password: hashed_password,
            role: i === 0 ? "admin" : "user",
            is_active: true,
        })),
    );

    await prisma.user.createMany({ data: users, skipDuplicates: true });
    console.log(`✅ Seed de user: ${users.length} registros creados (1 admin + ${TOTAL - 1} usuarios)`);
};
