import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation passwordLogin($input: UserPasswordLoginInput!) {
    passwordLogin(input: $input) {
      refreshToken
      accessToken
      user {
        id
        firstName
        lastName
        email
        phone
        permissions {
          name
        }
      }
    }
  }
`;

export const SET_PASSWORD = gql`
  mutation setPasswordForInvite($input: UserPasswordForInviteInput) {
    setPasswordForInvite(input: $input) {
      id
      email
      phone
      firstName
      middleName
      lastName
    }
  }
`;

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;
