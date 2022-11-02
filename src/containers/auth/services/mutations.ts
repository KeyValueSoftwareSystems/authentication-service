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

export const LOGOUT = gql`
  mutation logout {
    logout
  }
`;
