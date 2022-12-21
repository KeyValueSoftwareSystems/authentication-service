import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationIssueFix1671516221241 implements MigrationInterface {
  name = 'MigrationIssueFix1671516221241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ALTER COLUMN "entity_id" TYPE uuid USING "entity_id"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ALTER COLUMN "permission_id" TYPE uuid USING "permission_id"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" DROP CONSTRAINT "PK_ac18341de235a9dddb822c35892"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ADD CONSTRAINT "PK_22d409e099ab8a6bc3fc7b7b8a1" PRIMARY KEY ("entity_id", "permission_id")`,
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
      `ALTER TABLE "entity_permission" ALTER COLUMN "permission_id" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_permission" ALTER COLUMN "entity_id" TYPE character varying`,
    );
  }
}
