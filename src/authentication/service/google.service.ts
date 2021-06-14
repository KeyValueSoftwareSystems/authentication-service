import { Injectable } from '@nestjs/common';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { GoogleLoginInput } from 'src/schema/graphql.schema';
import {
  GoogleSetupError,
  InvalidPayloadException,
} from '../exception/userauth.exception';
import User from 'src/authorization/entity/user.entity';
import { GoogleUserSchema } from '../validation/userauthschema.validation';
import UserService from 'src/authorization/service/user.service';
import { AuthenticationHelper } from '../authentication.helper';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
    private authenticationHelper: AuthenticationHelper,
  ) {}
  async login(googleLoginInput: GoogleLoginInput) {
    const CLIENT_ID = this.configService.get('GOOGLE_CLIENT_ID');
    if (!CLIENT_ID) {
      throw new GoogleSetupError();
    }

    const { idToken } = googleLoginInput;
    const client: OAuth2Client = new OAuth2Client(CLIENT_ID);
    let payload: TokenPayload | undefined;
    try {
      const ticket: LoginTicket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      throw new InvalidPayloadException(e.message);
    }

    const user = {
      email: payload?.email,
      firstName: payload?.given_name,
      lastName: payload?.family_name,
    };

    const { error } = GoogleUserSchema.validate(user);
    if (error) {
      throw new InvalidPayloadException(
        'Insufficient data from Google signin. '.concat(error.message),
      );
    }

    return user;
  }

  async googleLogin(googleLoginInput: GoogleLoginInput) {
    const googleUser = await this.login(googleLoginInput);

    let existingUserDetails = await this.userService.getUserDetailsByEmailOrPhone(
      googleUser.email,
    );

    if (!existingUserDetails) {
      const userFromInput = new User();
      userFromInput.email = googleUser.email;
      userFromInput.firstName = googleUser.firstName as string;
      userFromInput.lastName = googleUser.lastName as string;
      userFromInput.origin = 'google';

      existingUserDetails = await this.userService.createUser(userFromInput);
    }

    const tokenData = await this.authenticationHelper.createToken(
      existingUserDetails,
    );
    return tokenData;
  }
}
