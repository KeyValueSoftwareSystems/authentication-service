import { TokenResponse, UserLoginInput, UserSignupInput, UserSignupResponse } from '../../schema/graphql.schema';

export abstract class Authenticatable {
  abstract userSignup(userDetails: UserSignupInput): Promise<UserSignupResponse> ;

  abstract userLogin(userDetails: UserLoginInput): Promise<TokenResponse> ; 
}