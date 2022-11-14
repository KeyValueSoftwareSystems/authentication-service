import { PermissionsType } from 'src/authorization/constants/authorization.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoleMigration1652639112645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_role" ("deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" uuid NOT NULL, "group_id" uuid NOT NULL, CONSTRAINT "PK_34b9a049ae09a85e87e7f18787b" PRIMARY KEY ("role_id", "group_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permission" ("deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "permission_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY ("permission_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX role_name_unique_idx on "role" (LOWER(name)) where (deleted_at is null);`,
    );
    await queryRunner.query(
      `INSERT INTO public.permission (name) VALUES ('${PermissionsType.CreateRoles}'), ('${PermissionsType.EditRoles}'), ('${PermissionsType.DeleteRoles}'), ('${PermissionsType.ViewRoles}');`,
    );
    await queryRunner.query(`INSERT INTO public.role (name) VALUES ('Admin');`);
    await queryRunner.query(
      `INSERT INTO public.group_role ("group_id", "role_id") VALUES ((select id from public.group where name = 'Admin'), (select id from public.role where name = 'Admin'));`,
    );
    await queryRunner.query(`
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.CreatePermissions}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.EditPermissions}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.DeletePermissions}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.ViewPermissions}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.CreateGroups}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.EditGroups}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.DeleteGroups}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.ViewGroups}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.CreateEntities}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.EditEntities}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.DeleteEntities}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.ViewEntities}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.EditUser}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.DeleteUser}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.ViewUser}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.CreateRoles}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.EditRoles}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.DeleteRoles}'));
       INSERT INTO public.role_permission ("role_id", "permission_id") VALUES ((select id from public.role where name = 'Admin'), (select id from public.permission where name = '${PermissionsType.ViewRoles}'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_permission"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "group_role"`);
    await queryRunner.query(
      `DELETE FROM public."permission" WHERE "name" IN ('${PermissionsType.CreateRoles}', '${PermissionsType.EditRoles}', '${PermissionsType.DeleteRoles}', '${PermissionsType.ViewRoles}')`,
    );
  }
}
