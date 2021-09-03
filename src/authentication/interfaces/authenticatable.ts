import { TokenResponse, UserPasswordLoginInput, UserPasswordSignupInput, UserOTPLoginInput, UserOTPSignupInput, UserSignupResponse } from '../../schema/graphql.schema';

export abstract class Authenticatable {
  abstract userSignup(userDetails: UserPasswordSignupInput | UserOTPSignupInput): Promise<UserSignupResponse> ;

  abstract userLogin(userDetails: UserPasswordLoginInput | UserOTPLoginInput): Promise<TokenResponse> ; 
}