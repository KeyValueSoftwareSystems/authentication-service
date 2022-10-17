import { gql } from "@apollo/client";

export const GET_ROLE_PERMISSIONS = gql`
  query getRolePermissions($id: ID!) {
    getRolePermissions(id: $id) {
      id
      name
    }
  }
`;

export const GET_ROLES = gql`
  query getRoles {
    getRoles {
      id
      name
    }
  }
`;

export const GET_ROLE = gql`
  query getRole($id: ID!) {
    getRole(id: $id) {
      id
      name
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
