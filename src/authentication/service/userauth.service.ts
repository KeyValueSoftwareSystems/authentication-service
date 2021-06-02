import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
      throw new BadRequestException(
        'User details exist. Cannot signup this user.',
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
      const hashedPassword = userRecord.password;
      const plainTextPassword = userDetails.password as string;
      if (
        this.authenticationHelper.isPasswordValid(
          plainTextPassword,
          hashedPassword,
        )
      ) {
        const tokenData = this.authenticationHelper.createToken(userRecord);
        return tokenData;
      }
      throw new UnauthorizedException({
        error: 'Invalid credentials',
      });
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
          userRecord.password,
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
      throw new BadRequestException({
        error: 'Current password is incorrect',
      });
    }
    throw new UserNotFoundException(username);
  }
}
