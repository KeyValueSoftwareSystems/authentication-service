import { Permission } from "./permission";

export interface Role {
  id: string;
  name: string;
  permissions?: Permission[];
}

export interface NewRole {
  name: string;
}

export interface RolePermission {
  rolePermission: Permission[];
}
