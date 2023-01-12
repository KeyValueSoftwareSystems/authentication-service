import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import User from '../../authorization/entity/user.entity';
import {
  PasswordAlreadySetException,
  UserNotFoundException,
} from '../../authorization/exception/user.exception';
import { UserServiceInterface } from '../../authorization/service/user.service.interface';
import {
  InviteTokenResponse,
  Status,
  TokenResponse,
  UserInviteTokenSignupInput,
  UserPasswordForInviteInput,
  UserPasswordLoginInput,
  UserPasswordSignupInput,
  UserSignupResponse,
} from '../../schema/graphql.schema';
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
    @Inject(UserServiceInterface) private userService: UserServiceInterface,
    private tokenService: TokenService,
    private authenticationHelper: AuthenticationHelper,
    private dataSource: DataSource,
    private configService: ConfigService,
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

  async inviteTokenSignup(
    userDetails: UserInviteTokenSignupInput,
  ): Promise<InviteTokenResponse> {
    const verifyUser = await this.userService.verifyDuplicateUser(
      userDetails.email,
      userDetails.phone,
    );
    if (verifyUser.existingUserDetails) {
      throw new UserExistsException(
        verifyUser.existingUserDetails,
        verifyUser.duplicate,
      );
    }
    const userFromInput = new User();
    userFromInput.email = userDetails.email;
    userFromInput.phone = userDetails.phone;
    userFromInput.firstName = userDetails.firstName;
    userFromInput.middleName = userDetails.middleName;
    userFromInput.lastName = userDetails.lastName;
    userFromInput.status = Status.INVITED;
    let invitationToken: { token: any; tokenExpiryTime?: any };
    const transaction = await this.dataSource.manager.transaction(async () => {
      const savedUser = await this.userService.createUser(userFromInput);
      invitationToken = this.authenticationHelper.generateInvitationToken(
        { id: savedUser.id },
        this.configService.get('INVITATION_TOKEN_EXPTIME'),
      );
      await this.userService.updateField(
        savedUser.id,
        'inviteToken',
        invitationToken.token,
      );
      const user = await this.userService.getUserById(savedUser.id);
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        inviteToken: user?.inviteToken,
        status: user.status,
      };
      return {
        inviteToken: invitationToken.token,
        tokenExpiryTime: invitationToken.tokenExpiryTime,
        user: userResponse,
      };
    });
    return transaction;
  }

  async setPasswordForInvitedUser(
    passwordDetails: UserPasswordForInviteInput,
  ): Promise<UserSignupResponse> {
    const verificationResponse: any = this.authenticationHelper.validateInvitationToken(
      passwordDetails.inviteToken,
    );
    const user = await this.userService.getUserById(verificationResponse.id);
    if (user.password) {
      throw new PasswordAlreadySetException(user.id);
    }
    const plainTextPassword = passwordDetails.password as string;
    const hashedPassword = this.authenticationHelper.generatePasswordHash(
      plainTextPassword,
    );
    user.password = hashedPassword;
    user.status = Status.ACTIVE;
    const updatedUser = this.userService.updateUser(user.id, user);
    return updatedUser;
  }

  async userLogin(userDetails: UserPasswordLoginInput): Promise<TokenResponse> {
    const userRecord = await this.userService.getUserDetailsByUsername(
      userDetails.username,
      userDetails.username,
    );
    if (!userRecord) {
      throw new UserNotFoundException(userDetails.username);
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
      return this.tokenService.getNewToken(userRecord);
    }
  }
}
