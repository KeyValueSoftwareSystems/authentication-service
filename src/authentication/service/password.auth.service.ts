import { Injectable } from '@nestjs/common';
import {
  Status,
  TokenResponse,
  UserPasswordLoginInput,
  UserPasswordSignupInput,
  UserSignupResponse,
} from '../../schema/graphql.schema';
import User from '../../authorization/entity/user.entity';
import UserService from '../../authorization/service/user.service';
import {
  InactiveAccountException,
  UserNotFoundException,
} from '../../authorization/exception/user.exception';
import { AuthenticationHelper } from '../authentication.helper';
import {
  InvalidCredentialsException,
  InvalidPayloadException,
  UserExistsException,
} from '../exception/userauth.exception';
import { Authenticatable } from '../interfaces/authenticatable';
import { TokenService } from './token.service';

@Injectable()
export default class PasswordAuthService implements Authenticatable {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private authenticationHelper: AuthenticationHelper,
  ) {}

  async userSignup(
    userDetails: UserPasswordSignupInput,
  ): Promise<UserSignupResponse> {
    const verifyObj = await this.userService.verifyDuplicateUser(
      userDetails.email,
      userDetails.phone,
    );
    if (verifyObj.existingUserDetails) {
      throw new UserExistsException(
        verifyObj.existingUserDetails,
        verifyObj.duplicate,
      );
    }

    const userFromInput = new User();
    userFromInput.email = userDetails.email;
    userFromInput.phone = userDetails.phone;
    userFromInput.firstName = userDetails.firstName;
    userFromInput.middleName = userDetails.middleName;
    userFromInput.lastName = userDetails.lastName;
    userFromInput.status = Status.ACTIVE;

    const plainTextPassword = userDetails.password as string;
    userFromInput.password = this.authenticationHelper.generatePasswordHash(
      plainTextPassword,
    );

    return this.userService.createUser(userFromInput);
  }

  async userLogin(userDetails: UserPasswordLoginInput): Promise<TokenResponse> {
    const userRecord:
      | User
      | undefined = await this.userService.getUserDetailsByUsername(
      userDetails.username,
      userDetails.username,
    );
    if (!userRecord) {
      throw new UserNotFoundException(userDetails.username);
    }
    if (userRecord?.status == Status.INACTIVE) {
      throw new InactiveAccountException();
    }
    const token = await this.loginWithPassword(userRecord, userDetails);
    if (!token) {
      throw new InvalidCredentialsException();
    }
    const tokenResponse: TokenResponse = { ...token, user: userRecord };
    return tokenResponse;
  }

  async updatePassword(userId: string, passwordDetails: any): Promise<User> {
    const userRecord: User = await this.userService.getUserById(userId);

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
    throw new UserNotFoundException(userId);
  }

  private async loginWithPassword(
    userRecord: User,
    userDetails: UserPasswordLoginInput,
  ) {
    const hashedPassword = userRecord.password as string;
    const plainTextPassword = userDetails.password as string;
    if (
      hashedPassword != null &&
      this.authenticationHelper.isPasswordValid(
        plainTextPassword,
        hashedPassword,
      )
    ) {
      return await this.tokenService.getNewToken(userRecord);
    }
  }
}
