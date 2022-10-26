import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserStatusInviteToken1666763401586 implements MigrationInterface {
  name = 'UserStatusInviteToken1666763401586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "user_phone_unique_idx"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "status" character varying NOT NULL DEFAULT 'inactive'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "invite_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_ac18341de235a9dddb822c35892"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("permission_id", "entity_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_451db0ef409dd0b566c4efca6a3" PRIMARY KEY ("entity_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD "permission_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_451db0ef409dd0b566c4efca6a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("entity_id", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_ac18341de235a9dddb822c35892" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP COLUMN "entity_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD "entity_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_ac18341de235a9dddb822c35892"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("permission_id", "entity_id")`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "status"='active' WHERE "deleted_at" IS NULL `,
    );
    await queryRunner.query(
      `UPDATE "user" SET "status"='inactive' WHERE "deleted_at" IS NOT NULL `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_ac18341de235a9dddb822c35892" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP COLUMN "entity_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD "entity_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_ac18341de235a9dddb822c35892"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("entity_id", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_451db0ef409dd0b566c4efca6a3" PRIMARY KEY ("entity_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD "permission_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_451db0ef409dd0b566c4efca6a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("permission_id", "entity_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_ac18341de235a9dddb822c35892" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "invite_token"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "user_phone_unique_idx" ON "user" ("phone") WHERE (deleted_at IS NULL)`,
    );
  }
}
