import { gql } from "@apollo/client";

export const DELETE_USER = gql`
  mutation ($id: ID!) {
    deleteUser(id: $id) {
      firstName
    }
  }
`;
