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
import { ConfigService } from '@nestjs/config';
import { OtpGeneratorService } from './otp.generator.service';
import messages from '../../constants/messages';
import SmsService from '../../notification/service/sms.service';

@Injectable()
export default class UserAuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private otpService: OtpGeneratorService,
    private smsService: SmsService,
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

    let token;
    if (!userRecord) {
      throw new UserNotFoundException(userDetails.username);
    }
    if (
      userRecord?.twoFAEnabled &&
      this.configService.get('ENFORCE_2FA') == 'true' &&
      userDetails.otp
    ) {
      // When 2FA is enabled and enforced 2FA to login
      token = await this.loginWith2FA(userDetails?.otp, userRecord);
    } else if (userDetails.otp) {
      // When logging in with non 2FA OTP
      token = await this.loginWithOTP(userDetails?.otp, userRecord);
    } else {
      token = await this.loginWithPassword(userRecord, userDetails);
    }
    if (!token) {
      throw new InvalidCredentialsException();
    }
    return token;
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

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = this.authenticationHelper.validateAuthToken(refreshToken);
    const userRecord: User | undefined = await this.userService.getUserById(
      response.sub,
    );
    if (userRecord.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }
    const token = this.authenticationHelper.generateTokenForUser(userRecord);
    await this.userService.updateField(
      userRecord.id,
      'refreshToken',
      token.refreshToken,
    );
    return token;
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateField(id, 'refreshToken', '');
  }

  async generateOtpAndSendMessage(phoneNumber: string): Promise<void> {
    const user = await this.userService.getActiveUserByPhoneNumber(phoneNumber);
    if (user && user.active && user.phone) {
      //Found an active user, generating OTP and sending the message to the user
      const otp = this.otpService.generateOTP(user.phone);
      const message = `${messages.TOTP_MESSAGE}${otp}`;
      await this.smsService.sendMessageWithTwilio(
        user.phone as string,
        message,
      );
    }
  }

  async generate2FACode(id: string) {
    const user = await this.userService.getUserById(id);
    const data = await this.otpService.generateTotpSecret(user);
    await this.userService.setOtpSecret(user, JSON.stringify(data.secret));
    return data.otpUri;
  }

  async enable2FA(code: string, id: string) {
    const user = await this.userService.getUserById(id);
    if (this.otpService.verify2FACode(code, user)) {
      await this.userService.updateField(id, 'twoFAEnabled', true);
    }
    throw new InvalidCredentialsException();
  }

  async loginWith2FA(code: string, user: User) {
    const isValidCode = this.otpService.verify2FACode(code, user);
    if (isValidCode) {
      const token: TokenResponse = this.authenticationHelper.generateTokenForUser(
        user,
      );
      await this.userService.updateField(
        user.id,
        'refreshToken',
        token.refreshToken,
      );
      return token;
    }
  }

  private async loginWithPassword(
    userRecord: User,
    userDetails: UserLoginInput,
  ) {
    const hashedPassword = userRecord.password as string;
    const plainTextPassword = userDetails.password as string;
    if (
      userRecord.active &&
      hashedPassword != null &&
      this.authenticationHelper.isPasswordValid(
        plainTextPassword,
        hashedPassword,
      )
    ) {
      const token: TokenResponse = this.authenticationHelper.generateTokenForUser(
        userRecord,
      );
      await this.userService.updateField(
        userRecord.id,
        'refreshToken',
        token.refreshToken,
      );
      return token;
    }
  }

  private async loginWithOTP(otp: string, user: User) {
    const isValidCode = this.otpService.validateOTP(otp, user?.phone);
    if (isValidCode) {
      const token: TokenResponse = this.authenticationHelper.generateTokenForUser(
        user,
      );
      await this.userService.updateField(
        user.id,
        'refreshToken',
        token.refreshToken,
      );
      return token;
    }
  }
}
