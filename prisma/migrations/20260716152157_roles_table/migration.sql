-- Roles pasan de un String en users a una tabla propia con FK.
-- SQL editado a mano: el generado por Prisma dropeaba la columna `role` sin
-- migrar los datos. Acá se crean los roles base, se backfillea role_id desde
-- el string actual y recién entonces se elimina la columna vieja.

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- Roles base (gen_random_uuid: nativo en PostgreSQL 13+)
INSERT INTO "roles" ("id", "name", "description", "updated_at") VALUES
    (gen_random_uuid(), 'admin', 'Acceso total a la administración', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'user', 'Usuario estándar', CURRENT_TIMESTAMP);

-- AlterTable: role_id primero nullable para poder backfillear
ALTER TABLE "users" ADD COLUMN "role_id" TEXT;

-- Backfill desde el string actual; cualquier rol desconocido cae a 'user'
UPDATE "users" SET "role_id" = r."id" FROM "roles" r WHERE r."name" = "users"."role";
UPDATE "users" SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'user') WHERE "role_id" IS NULL;

ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Recién ahora se elimina la columna vieja
ALTER TABLE "users" DROP COLUMN "role";
