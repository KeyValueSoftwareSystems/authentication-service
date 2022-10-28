import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserInviteToken1666948318504 implements MigrationInterface {
  name = 'UserInviteToken1666948318504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "invite_token" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "invite_token"`);
  }
}
