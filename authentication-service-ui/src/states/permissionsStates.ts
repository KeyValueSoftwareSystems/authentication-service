import { atom } from "recoil";
import { GroupPermissionsDetails } from "../types/permission";
import { Permission } from "../types/user";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

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

export const UserPermissionsAtom = atom<string[]>({
  key: "UserPermissions",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
