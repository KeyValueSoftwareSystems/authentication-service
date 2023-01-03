export interface GroupCacheServiceInterface {
  getGroupPermissionsFromGroupId(groupId: string): Promise<string[]>;

  getGroupRolesFromGroupId(groupId: string): Promise<string[]>;

  invalidateGroupPermissionsByGroupId(id: string): Promise<void>;

  invalidateGroupRolesByGroupId(id: string): Promise<void>;
}

export const GroupCacheServiceInterface = Symbol('GroupCacheServiceInterface');
