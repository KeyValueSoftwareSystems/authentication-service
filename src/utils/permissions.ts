import {
  EntityPermissionsDetails,
  Permission,
  RolePermissionsDetails,
} from "../types/permission";
import { Role } from "../types/role";

export const getUniquePermissions = (
  permissions: EntityPermissionsDetails[]
) => {
  const permissionsList: Permission[] = [];
  const ids: Array<string> = [];
  permissions?.forEach((item: EntityPermissionsDetails) =>
    permissionsList.push(...item?.permissions)
  );
  permissionsList?.forEach((permission: Permission) =>
    ids?.push(permission?.id)
  );
  return [...Array.from(new Set(ids))];
};

export const getOverallPermissions = (
  permissions: EntityPermissionsDetails[]
) => {
  const permissionsList: Permission[] = [];
  const overallPermissions: Array<string> = [];
  permissions?.forEach((item: EntityPermissionsDetails) =>
    permissionsList.push(...item?.permissions)
  );
  permissionsList?.forEach((permission: Permission) =>
    overallPermissions?.push(permission?.name)
  );
  return [...Array.from(new Set(overallPermissions))];
};
