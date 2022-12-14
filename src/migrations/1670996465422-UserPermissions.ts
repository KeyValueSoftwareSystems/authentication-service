import { PermissionsType } from 'src/authorization/constants/authorization.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPermissions1670996465422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` 
    WITH
        permissions AS (INSERT INTO public.permission (name) VALUES ('${PermissionsType.CreateUser}') RETURNING *)
        INSERT INTO public.role_permission ("role_id", "permission_id") 
        VALUES ((select id from public.role where name = 'Admin'), (SELECT permissions.id :: uuid FROM permissions));`);

    await queryRunner.query(` 
    INSERT INTO public.entity_permission ("entity_id", "permission_id")
            SELECT ent.id :: uuid, permissions.id :: uuid 
                FROM (SELECT id from public.entity_model WHERE name = 'User') as ent, 
                (select id from public.permission where name = '${PermissionsType.CreateUser}')  as permissions;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` 
        DELETE FROM public.role_permission AS rp USING permission p WHERE p.id = rp.permission_id AND p.name = '${PermissionsType.CreateUser}';
        DELETE FROM public.entity_permission AS ep USING permission p WHERE p.id :: uuid = ep.permission_id :: uuid AND p.name = '${PermissionsType.CreateUser}';
        DELETE FROM public.permission WHERE name = '${PermissionsType.CreateUser}';
    `);
  }
}
