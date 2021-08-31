import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class InitialDataMigration1630406596461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rawPassword: string = process.env.DEFAULT_ADMIN_PASSWORD as string;
    const password = bcrypt.hashSync(rawPassword, 10);
    await queryRunner.query(
      `INSERT INTO public."user" ("email", "password", "first_name", "last_name", "origin") VALUES ('admin@keyvalue.systems', '${password}', 'Admin', 'Keyvalue', 'simple' )`,
    );

    await queryRunner.query(` 
    WITH
        grp AS (INSERT INTO public.group (name) VALUES ('Admin') RETURNING *),
        permissions AS (INSERT INTO public.permission (name) VALUES 
            ('create-permissions'), ('edit-permissions'), ('delete-permissions'), ('view-permissions'), 
            ('create-groups'), ('edit-groups'), ('delete-groups'), ('view-groups'),
            ('create-entities'), ('edit-entities'), ('delete-entities'), ('view-entities'),
            ('edit-user'), ('view-user') RETURNING *)
		INSERT INTO public.group_permission SELECT permissions.id :: uuid, grp.id :: uuid FROM permissions, grp;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public."user" WHERE "email" = 'admin@keyvalue.systems'`,
    );

    await queryRunner.query(
      `DELETE FROM public."group" WHERE "name" = 'Admin'`,
    );

    await queryRunner.query(
      `DELETE FROM public."group_permission" WHERE "group_permission"."permission_id" IN (SELECT "id" FROM public."permission" WHERE "name" IN ('create-permissions', 'edit-permissions', 'delete-permissions', 'view-permissions', 
      'create-groups', 'edit-groups', 'delete-groups', 'view-groups', 'create-entities', 'edit-entities', 'delete-entities', 'view-entities',
       'edit-user', 'view-user'))`,
    );

    await queryRunner.query(
      `DELETE FROM public."permission" WHERE "name" IN ('create-permissions', 'edit-permissions', 'delete-permissions', 'view-permissions', 
      'create-groups', 'edit-groups', 'delete-groups', 'view-groups', 'create-entities', 'edit-entities', 'delete-entities', 'view-entities',
       'edit-user', 'view-user')`,
    );
  }
}
