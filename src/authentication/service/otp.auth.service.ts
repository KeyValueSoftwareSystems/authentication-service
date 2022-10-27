import { Injectable } from '@nestjs/common';
import User from '../../authorization/entity/user.entity';
import {
  InactiveAccountException,
  UserNotFoundException,
} from '../../authorization/exception/user.exception';
import UserService from '../../authorization/service/user.service';
import {
  Status,
  TokenResponse,
  UserOTPLoginInput,
  UserOTPSignupInput,
  UserSignupResponse,
} from '../../schema/graphql.schema';
import {
  InvalidCredentialsException,
  UserExistsException,
} from '../exception/userauth.exception';
import { Authenticatable } from '../interfaces/authenticatable';
import { OTPVerifiable } from '../interfaces/otp.verifiable';
import { TokenService } from './token.service';

@Injectable()
export default class OTPAuthService implements Authenticatable {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private otpService: OTPVerifiable,
  ) {}

  async userSignup(
    userDetails: UserOTPSignupInput,
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

    return this.userService.createUser(userFromInput);
  }

  async userLogin(userDetails: UserOTPLoginInput): Promise<TokenResponse> {
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
    const token = await this.loginWithOTP(
      userDetails.otp as string,
      userRecord,
    );
    if (!token) {
      throw new InvalidCredentialsException();
    }
    const tokenResponse: TokenResponse = { ...token, user: userRecord };
    return tokenResponse;
  }

  async sendOTP(phoneNumber: string): Promise<void> {
    const user = await this.userService.getActiveUserByPhoneNumber(phoneNumber);
    if (user && user.phone) {
      //Found an active user, generating OTP and sending the message to the user
      await this.otpService.sendOTP(user);
    } else {
      throw new UserNotFoundException(phoneNumber);
    }
  }

  private async loginWithOTP(otp: string, user: User) {
    const isValidCode = await this.otpService.validateOTP(otp, user);
    if (isValidCode) {
      return this.tokenService.getNewToken(user);
    }
  }
}
