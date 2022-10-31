import { EntityPermissionsDetails, Permission } from "../types/permission";

export const getUniquePermissions = (
  permissions: EntityPermissionsDetails[]
) => {
  const permissionsList = permissions.reduce((acc: Permission[], cur) => {
    acc.push(...cur.permissions);
    return acc;
  }, []);
  return [
    ...Array.from(
      new Set(permissionsList.map((permission: any) => permission.id))
    ),
  ];
};

export const getOverallPermissions = (
  permissions: EntityPermissionsDetails[]
) => {
  const permissionsList = permissions.reduce((acc: Permission[], cur) => {
    acc.push(...cur.permissions);
    return acc;
  }, []);
  return [
    ...Array.from(
      new Set(permissionsList.map((permission: any) => permission.name))
    ),
  ];
};
