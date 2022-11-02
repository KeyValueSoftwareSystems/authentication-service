import { Permission } from "./permission";

export interface NewEntity {
  name: string;
}

export interface Entity {
  id: string;
  name: string;
}

export interface EntityPermissionsDetails {
  id: string;
  name: string;
  permissions: Permission[];
}
