import { PermissionsType } from 'src/authorization/constants/authorization.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionEntityTypeDataMigration1670387635744
  implements MigrationInterface {
  name = 'PermissionEntityTypeDataMigration1670387635744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO public.entity_model (name) VALUES ('User'), ('Role'), ('Group'), ('Permission'), ('Entity');
        INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'Permission') as ent, (select id from public.permission where name IN 
                    ('${PermissionsType.CreatePermissions}', '${PermissionsType.EditPermissions}', '${PermissionsType.ViewPermissions}', '${PermissionsType.DeletePermissions}')) as permissions;
        INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'Group') as ent, (select id from public.permission where name IN 
                    ('${PermissionsType.CreateGroups}', '${PermissionsType.EditGroups}', '${PermissionsType.ViewGroups}', '${PermissionsType.DeleteGroups}'))  as permissions;
        INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'Role') as ent, (select id from public.permission where name IN 
                    ('${PermissionsType.CreateRoles}', '${PermissionsType.EditRoles}', '${PermissionsType.ViewRoles}', '${PermissionsType.DeleteRoles}'))  as permissions;
        INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'User') as ent, (select id from public.permission where name IN 
                    ('${PermissionsType.EditUser}', '${PermissionsType.DeleteUser}', '${PermissionsType.ViewUser}'))  as permissions;
        INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'Entity') as ent, (select id from public.permission where name IN 
                    ('${PermissionsType.CreateEntities}', '${PermissionsType.EditEntities}', '${PermissionsType.DeleteEntities}', '${PermissionsType.ViewEntities}'))  as permissions;
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        TRUNCATE entity;
        TRUNCATE entity_permission;
    `);
  }
}
