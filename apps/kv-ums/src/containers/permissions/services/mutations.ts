import { gql } from "@apollo/client";

export const DELETE_PERMISSION = gql`
  mutation ($id: ID!) {
    deletePermission(id: $id) {
      id
    }
  }
`;

export const UPDATE_PERMISSION = gql`
  mutation updatePermission($id: ID!, $input: UpdatePermissionInput!) {
    updatePermission(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const CREATE_PERMISSION = gql`
  mutation createPermission($input: NewPermissionInput!) {
    createPermission(input: $input) {
      id
      name
    }
  }
`;
