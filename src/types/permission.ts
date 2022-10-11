export interface Permission {
  id: string;
  name: string;
}

export interface RolePermissionsDetails {
  roleId: string;
  rolePermissions: Permission[];
}
