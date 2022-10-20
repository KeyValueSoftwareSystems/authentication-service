import { Permission } from "../types/permission";

export const getUniquePermissions = (permissions: any) => {
  const permissionsList: Permission[] = [];
  const ids: Array<string> = [];
  permissions?.forEach((item: any) =>
    permissionsList.push(...item?.permissions)
  );
  permissionsList?.forEach((permission: any) => ids?.push(permission?.id));
  return [...Array.from(new Set(ids))];
};

export const getOverallPermissions = (permissions: any) => {
  const permissionsList: Permission[] = [];
  const overallPermissions: Array<string> = [];
  permissions?.forEach((item: any) =>
    permissionsList.push(...item?.permissions)
  );
  permissionsList?.forEach((permission: any) =>
    overallPermissions?.push(permission?.name)
  );
  return [...Array.from(new Set(overallPermissions))];
};
