import { gql } from "@apollo/client";

export const DELETE_USER = gql`
  mutation ($id: ID!) {
    deleteUser(id: $id) {
      firstName
    }
  }
`;

export const CREATE_USER = gql`
  mutation inviteTokenSignup($input: UserInviteTokenSignupInput) {
    inviteTokenSignup(input: $input) {
      inviteToken
      tokenExpiryTime
      user {
        id
        email
        phone
        firstName
        middleName
        lastName
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      phone
      firstName
      middleName
      lastName
    }
  }
`;

export const UPDATE_USER_GROUPS = gql`
  mutation updateUserGroups($id: ID!, $input: UpdateUserGroupInput!) {
    updateUserGroups(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_USER_PERMISSIONS = gql`
  mutation updateUserPermissions($id: ID!, $input: UpdateUserPermissionInput!) {
    updateUserPermissions(id: $id, input: $input) {
      id
      name
    }
  }
`;
