import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1630316648319 implements MigrationInterface {
  name = 'InitialMigration1630316648319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "entity_model" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_11a0e33570270c3de3233b34a2a" UNIQUE ("name"), CONSTRAINT "PK_ea7e5d0ca6a0d6221f78cea499a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_permission" ("permission_id" character varying NOT NULL, "entity_id" character varying NOT NULL, CONSTRAINT "PK_ac18341de235a9dddb822c35892" PRIMARY KEY ("permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8a45300fd825918f3b40195fbdc" UNIQUE ("name"), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_permission" ("permission_id" uuid NOT NULL, "group_id" uuid NOT NULL, CONSTRAINT "PK_5aadf555f3ea93c95bc952f1547" PRIMARY KEY ("permission_id", "group_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_240853a0c3353c25fb12434ad33" UNIQUE ("name"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "phone" character varying, "password" character varying, "first_name" character varying NOT NULL, "middle_name" character varying, "last_name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "origin" character varying NOT NULL DEFAULT 'simple', "external_user_id" character varying, "refresh_token" character varying, "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "two_fa_secret" character varying, "two_fa_enabled" boolean DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_group" ("group_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_bd332ba499e012f8d20905f8061" PRIMARY KEY ("group_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_permission" ("permission_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_e55fe6295b438912cb42bce1baa" PRIMARY KEY ("permission_id", "user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_permission"`);
    await queryRunner.query(`DROP TABLE "user_group"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TABLE "group_permission"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "entity_permission"`);
    await queryRunner.query(`DROP TABLE "entity_model"`);
  }
}
