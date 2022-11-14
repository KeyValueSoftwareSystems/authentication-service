export interface Permission {
  id: string;
  name: string;
}

export interface RolePermissionsDetails {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface GroupPermissionsDetails {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface EntityPermissionsDetails {
  id: string;
  name: string;
  permissions: Permission[];
}
