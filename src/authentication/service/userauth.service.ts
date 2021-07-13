import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  TokenResponse,
  UserLoginInput,
  UserSignupInput,
  UserSignupResponse,
} from 'src/schema/graphql.schema';
import User from '../../authorization/entity/user.entity';
import UserService from '../../authorization/service/user.service';
import { UserNotFoundException } from '../../authorization/exception/user.exception';
import { AuthenticationHelper } from '../authentication.helper';
import {
  InvalidCredentialsException,
  InvalidPayloadException,
  UserExistsException,
} from '../exception/userauth.exception';

@Injectable()
export default class UserauthService {
  constructor(
    private userService: UserService,
    private authenticationHelper: AuthenticationHelper,
  ) {}

  async userSignup(userDetails: UserSignupInput): Promise<UserSignupResponse> {
    const existingUserDetails = await this.userService.getUserDetailsByEmailOrPhone(
      userDetails.email,
      userDetails.phone,
    );
    if (existingUserDetails) {
      throw new UserExistsException(
        userDetails.email || userDetails.phone || '',
      );
    }

    const userFromInput = new User();
    userFromInput.email = userDetails.email;
    userFromInput.phone = userDetails.phone;
    userFromInput.firstName = userDetails.firstName;
    userFromInput.middleName = userDetails.middleName;
    userFromInput.lastName = userDetails.lastName;

    const plainTextPassword = userDetails.password;
    userFromInput.password = this.authenticationHelper.generatePasswordHash(
      plainTextPassword,
    );

    return this.userService.createUser(userFromInput);
  }

  async userLogin(userDetails: UserLoginInput): Promise<TokenResponse> {
    const userRecord:
      | User
      | undefined = await this.userService.getUserDetailsByUsername(
      userDetails.username,
      userDetails.username,
    );

    if (userRecord && userRecord.active) {
      const hashedPassword = userRecord.password as string;
      const plainTextPassword = userDetails.password as string;
      if (
        hashedPassword != null &&
        this.authenticationHelper.isPasswordValid(
          plainTextPassword,
          hashedPassword,
        )
      ) {
        return this.authenticationHelper.generateTokenForUser(userRecord);
      }
      throw new InvalidCredentialsException();
    }
    throw new UserNotFoundException(userDetails.username);
  }

  async updatePassword(username: string, passwordDetails: any): Promise<User> {
    const userRecord:
      | User
      | undefined = await this.userService.getUserDetailsByUsername(
      username,
      username,
    );

    if (userRecord) {
      if (
        this.authenticationHelper.isPasswordValid(
          passwordDetails.currentPassword,
          userRecord.password as string,
        )
      ) {
        const hashedPassword = this.authenticationHelper.generatePasswordHash(
          passwordDetails.newPassword,
        );

        await this.userService.updateField(
          userRecord.id,
          'password',
          hashedPassword,
        );
        return userRecord;
      }
      throw new InvalidPayloadException('Current password is incorrect');
    }
    throw new UserNotFoundException(username);
  }

  async refresh(token: string): Promise<TokenResponse> {
    const response = this.authenticationHelper.validateAuthToken(token);
    const userRecord: User | undefined = await this.userService.getUserById(
      response.sub,
    );
    if (userRecord.refreshToken !== token) {
      throw new UnauthorizedException();
    }
    return this.authenticationHelper.generateTokenForUser(userRecord);
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateField(id, 'password', '');
  }
}
