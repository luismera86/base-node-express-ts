import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1742440657285 implements MigrationInterface {
    name = 'AddUserTable1742440657285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`);
    }

}
