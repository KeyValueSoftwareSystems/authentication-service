import { gql } from "@apollo/client";

export const GET_GROUP = gql`
  query getGroup($id: ID!) {
    getGroup(id: $id){
      id
      name
    }
  }
`;

export const GET_GROUP_DETAILS = gql`
  query getGroup($id: ID!) {
    getGroup(id: $id){
      id
      name
    }
  }
`;

export const GET_GROUP_ROLES = gql`
  query getGroupRoles($id: ID!) {
    getGroupRoles(id: $id) {
      id
      name
    }
  }
`;

export const GET_GROUP_PERMISSIONS = gql`
  query getGroupPermissions($id: ID!) {
    getGroupPermissions(id: $id) {
      id
      name
    }
  }
`;
