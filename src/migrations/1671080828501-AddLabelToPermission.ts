import { PermissionsType } from 'src/authorization/constants/authorization.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLabelToPermission1671080828501 implements MigrationInterface {
  name = 'AddLabelToPermission1671080828501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "label" character varying`,
    );

    await queryRunner.query(
      `UPDATE "permission" AS p 
                SET label = permissions.label
            FROM (VALUES 
                    ('${PermissionsType.CreatePermissions}','Create Permissions'),
                    ('${PermissionsType.EditPermissions}','Edit Permissions'),
                    ('${PermissionsType.DeletePermissions}','Delete Permissions'),
                    ('${PermissionsType.ViewPermissions}','View Permissions'),
                    ('${PermissionsType.CreateGroups}','Create Groups'),
                    ('${PermissionsType.EditGroups}','Edit Groups'),
                    ('${PermissionsType.DeleteGroups}','Delete Groups'),
                    ('${PermissionsType.ViewGroups}','View Groups'),
                    ('${PermissionsType.CreateEntities}','Create Entities'),
                    ('${PermissionsType.EditEntities}','Edit Entities'),
                    ('${PermissionsType.DeleteEntities}','Delete Entities'),
                    ('${PermissionsType.ViewEntities}','View Entities'),
                    ('${PermissionsType.CreateUser}','Create User'),
                    ('${PermissionsType.EditUser}','Edit User'),
                    ('${PermissionsType.ViewUser}','View User'),
                    ('${PermissionsType.DeleteUser}','Delete User'),
                    ('${PermissionsType.CreateRoles}','Create Roles'),
                    ('${PermissionsType.EditRoles}','Edit Roles'),
                    ('${PermissionsType.DeleteRoles}','Delete Roles'),
                    ('${PermissionsType.ViewRoles}','View Roles')
                ) AS permissions(name, label)
            WHERE permissions.name = p.name`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "permission" SET label = null WHERE name IN (
                '${PermissionsType.CreatePermissions}', '${PermissionsType.EditPermissions}', '${PermissionsType.DeletePermissions}', '${PermissionsType.ViewPermissions}', 
                '${PermissionsType.CreateGroups}', '${PermissionsType.EditGroups}', '${PermissionsType.DeleteGroups}', '${PermissionsType.ViewGroups}',
                '${PermissionsType.CreateEntities}', '${PermissionsType.EditEntities}', '${PermissionsType.DeleteEntities}', '${PermissionsType.ViewEntities}',
                '${PermissionsType.CreateUser}','${PermissionsType.EditUser}', '${PermissionsType.ViewUser}', '${PermissionsType.DeleteUser}',
                '${PermissionsType.CreateRoles}', '${PermissionsType.EditRoles}', '${PermissionsType.DeleteRoles}', '${PermissionsType.ViewRoles}'
            )`,
    );

    await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "label"`);
  }
}
