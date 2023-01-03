import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';
import Permission from '../entity/permission.entity';

export interface PermissionServiceInterface {
  getAllPermissions(): Promise<Permission[]>;

  getPermissionById(id: string): Promise<Permission>;

  createPermission(newPermissionInput: NewPermissionInput): Promise<Permission>;

  updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission>;

  deletePermission(id: string): Promise<Permission>;
}

export const PermissionServiceInterface = Symbol('PermissionServiceInterface');
