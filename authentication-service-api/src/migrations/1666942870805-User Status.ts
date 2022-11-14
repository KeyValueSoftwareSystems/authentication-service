import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatus1666942870805 implements MigrationInterface {
  name = 'UserStatus1666942870805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM('INVITED', 'INACTIVE', 'ACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "status" "user_status_enum" NOT NULL DEFAULT 'INACTIVE'`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "status"='ACTIVE' WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "status"='INACTIVE' WHERE "deleted_at" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
  }
}
