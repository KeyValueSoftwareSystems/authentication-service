import Role from '../entity/role.entity';
import {
  NewRoleInput,
  RoleInputFilter,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from 'src/schema/graphql.schema';
import Permission from '../entity/permission.entity';

export interface RoleServiceInterface {
  getAllRoles(input?: RoleInputFilter): Promise<[Role[], number]>;

  getRoleById(id: string): Promise<Role>;

  createRole(role: NewRoleInput): Promise<Role>;

  updateRole(id: string, role: UpdateRoleInput): Promise<Role>;

  deleteRole(id: string): Promise<Role>;

  updateRolePermissions(
    id: string,
    request: UpdateRolePermissionInput,
  ): Promise<Permission[]>;

  getRolePermissions(id: string): Promise<Permission[]>;
}

export const RoleServiceInterface = Symbol('RoleServiceInterface');
