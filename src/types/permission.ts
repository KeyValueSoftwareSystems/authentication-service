export interface Permission {
  id: string;
  name: string;
}

export interface RolePermissionsDetails {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface GroupPermissionsDetails {
  groupId: string;
  permissions: Permission[];
}
