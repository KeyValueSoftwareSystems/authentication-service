import { gql } from "@apollo/client";

export const VERIFY_USER_PERMISSION = gql`
  query ($params: UserPermissionsVerification!) {
    verifyUserPermission(params: $params)
  }
`;
