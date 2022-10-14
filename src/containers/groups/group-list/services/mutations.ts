import { gql } from "@apollo/client";

export const DELETE_GROUPS = gql`
  mutation ($id: ID!) {
    deleteGroups(id: $id) {
      id
      name
    }
  }
`;
