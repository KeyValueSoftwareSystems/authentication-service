export interface PermissionCacheServiceInterface {
  getPermissionsFromCache(
    permissionName: string,
  ): Promise<{ id: string; name: string }>;

  invalidatePermissionsCache(name: string): Promise<void>;
}

export const PermissionCacheServiceInterface = Symbol(
  'PermissionCacheServiceInterface',
);
