import { Permission, RolePermissionsDetails } from "../types/permission";

export const getUniquePermissions = (
  permissions: RolePermissionsDetails[]
): string[] => {
  const groupPermissions: string[] = [];
  permissions.map((permission: RolePermissionsDetails) =>
    permission.rolePermissions.map((item: Permission) =>
      groupPermissions.push(item.id)
    )
  );
  const uniquePermissions: string[] = [];
  groupPermissions.forEach((c: string) => {
    if (!uniquePermissions.includes(c)) {
      uniquePermissions.push(c);
    }
  });
  return uniquePermissions;
};
