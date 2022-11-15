import { gql } from "@apollo/client";

export const CREATE_ROLE = gql`
  mutation createRole($input: NewRoleInput!) {
    createRole(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation updateRole($id: ID!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROLE_PERMISSIONS = gql`
  mutation updateRolePermissions($id: ID!, $input: UpdateRolePermissionInput!) {
    updateRolePermissions(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation ($id: ID!) {
    deleteRole(id: $id) {
      id
      name
    }
  }
`;
