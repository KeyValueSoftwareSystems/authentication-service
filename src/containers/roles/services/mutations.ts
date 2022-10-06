import { gql } from "@apollo/client";

export const DELETE_ROLE = gql`
  mutation ($id: ID!) {
    deleteRole(id: $id) {
      id
      name
    }
  }
`;
