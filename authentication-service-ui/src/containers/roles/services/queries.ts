import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query getRoles($value: String) {
    getRoles(input: { search: { or: { name: { contains: $value } } } }) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;

export const GET_ROLE = gql`
  query getRole($id: ID!) {
    getRole(id: $id) {
      id
      name
      permissions {
        id
        name
      }
    }
  }
`;

export const GET_GROUP_ROLES = gql`
  query ($id: ID!) {
    getGroupRoles(id: $id) {
      id
      name
    }
  }
`;

export const GET_ROLE_PERMISSIONS = gql`
  query getRolePermissions($id: ID!) {
    getRolePermissions(id: $id) {
      id
      name
    }
  }
`;
