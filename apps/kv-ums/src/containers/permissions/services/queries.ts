import { gql } from "@apollo/client";

export const GET_PERMISSIONS = gql`
  query getPermissions {
    getPermissions {
      id
      name
    }
  }
`;
