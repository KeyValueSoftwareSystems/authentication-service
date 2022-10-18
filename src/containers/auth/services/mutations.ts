import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation passwordLogin($input: UserPasswordLoginInput!) {
    passwordLogin(input: $input) {
      refreshToken
      accessToken
    }
  }
`;
