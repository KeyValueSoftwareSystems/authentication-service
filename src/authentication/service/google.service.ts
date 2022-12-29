import { Inject, Injectable } from '@nestjs/common';
import { InvalidPayloadException } from '../exception/userauth.exception';
import User from '../../authorization/entity/user.entity';
import { GoogleUserSchema } from '../validation/user.auth.schema.validation';
import { UserService } from '../../authorization/service/user.service';
import { AuthenticationHelper } from '../authentication.helper';
import { GoogleLoginUser } from '../passport/googleStrategy';

@Injectable()
export class GoogleAuthService {
  constructor(
    @Inject('UserService') private userService: UserService,
    private authenticationHelper: AuthenticationHelper,
  ) {}
  private async validateInput(
    googleLoginInput: GoogleLoginUser,
  ): Promise<GoogleLoginUser> {
    const { error } = GoogleUserSchema.validate(googleLoginInput);
    if (error) {
      throw new InvalidPayloadException(
        'Insufficient data from Google signin. '.concat(error.message),
      );
    }

    return googleLoginInput;
  }

  async googleLogin(googleLoginInput: GoogleLoginUser) {
    return this.validateInput(googleLoginInput)
      .then((googleUser) => {
        return this.userService.getUserDetailsByEmailOrPhone(googleUser.email);
      })
      .then((existingUserDetails) => {
        if (!existingUserDetails) {
          const userFromInput = new User();
          return this.userService.createUser({
            ...userFromInput,
            ...googleLoginInput,
            origin: 'google',
          });
        } else return existingUserDetails;
      })
      .then((user) => {
        const token = this.authenticationHelper.generateTokenForUser(user);
        this.userService.updateField(
          user.id,
          'refreshToken',
          token.refreshToken,
        );
        return token;
      });
  }
}
