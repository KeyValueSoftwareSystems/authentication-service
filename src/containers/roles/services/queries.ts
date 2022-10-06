import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query getRoles {
    getRoles {
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
