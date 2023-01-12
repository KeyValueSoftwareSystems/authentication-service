export interface UserCacheServiceInterface {
  getUserGroupsByUserId(userId: string): Promise<string[]>;

  getUserPermissionsByUserId(userId: string): Promise<string[]>;

  invalidateUserPermissionsCache(userId: string): Promise<void>;

  invalidateUserGroupsCache(userId: string): Promise<void>;
}

export const UserCacheServiceInterface = Symbol('UserCacheServiceInterface');
