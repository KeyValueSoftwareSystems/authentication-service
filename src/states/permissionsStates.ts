import { atom } from "recoil";
import { Permission } from "../types/user";

export const permissionsListAtom = atom<Permission[]>({
  key: "PermissionsList",
  default: [],
});

export const GroupPermissionsAtom = atom<Permission[]>({
  key: "GroupPermissionsList",
  default: [],
});

export const RolePermissionsAtom = atom<Permission[]>({
  key: "RolePermissions",
  default: [],
});
