import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatus1666867573882 implements MigrationInterface {
  name = 'UserStatus1666867573882';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
