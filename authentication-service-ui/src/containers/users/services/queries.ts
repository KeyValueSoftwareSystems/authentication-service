import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      phone
      firstName
      middleName
      lastName
      status
      groups {
        id
        name
      }
      permissions {
        id
        name
      }
      inviteToken
    }
  }
`;

export const GET_USERS = gql`
  query getUsers($value: String) {
    getUsers(
      input: {
        search: {
          or: {
            firstName: { contains: $value }
            middleName: { contains: $value }
            lastName: { contains: $value }
            email: { contains: $value }
          }
        }
      }
    ) {
      id
      email
      firstName
      middleName
      lastName
      status
      groups {
        id
        name
      }
      inviteToken
    }
  }
`;

export const GET_USER_GROUPS = gql`
  query ($id: ID!) {
    getUserGroups(id: $id) {
      id
      name
    }
  }
`;

export const GET_USER_PERMISSIONS = gql`
  query getUserPermissions($id: ID!) {
    getUserPermissions(id: $id) {
      id
      name
    }
  }
`;
