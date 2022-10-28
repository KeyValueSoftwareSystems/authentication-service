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
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;
