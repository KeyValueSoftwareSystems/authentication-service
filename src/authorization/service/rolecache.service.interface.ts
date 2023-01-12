export interface RoleCacheServiceInterface {
  getRolePermissionsFromRoleId(roleId: string): Promise<string[]>;

  invalidateRolePermissionsByRoleId(id: string): Promise<void>;
}

export const RoleCacheServiceInterface = Symbol('RoleCacheServiceInterface');
