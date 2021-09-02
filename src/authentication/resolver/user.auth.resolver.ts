import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import {
  Enable2FAInput,
  GenerateOtpInput,
  RefreshTokenInput,
  TokenResponse,
  UserLoginInput,
  UserSignupResponse,
} from '../../schema/graphql.schema';
import User from '../../authorization/entity/user.entity';
import { AuthGuard } from '../authentication.guard';
import {
  GenerateOtpInputSchema,
  UserOTPLoginInputSchema,
  UserOTPSignupInputSchema,
  UserPasswordInputSchema,
  UserPasswordLoginInputSchema,
  UserPasswordSignupInputSchema,
} from '../validation/user.auth.schema.validation';
import ValidationPipe from '../../validation/validation.pipe';
import PasswordAuthService from '../service/password.auth.service';
import OTPAuthService from '../service/otp.auth.service';
import { TokenService } from '../service/token.service';

@Resolver('Userauth')
export default class UserAuthResolver {
  constructor(private readonly passwordAuthService: PasswordAuthService,
    private readonly otpAuthService: OTPAuthService,
    private readonly tokenService: TokenService) {}

  @Mutation('passwordLogin')
  @UsePipes(new ValidationPipe(UserPasswordLoginInputSchema))
  async passwordLogin(
    @Args('input') request: UserLoginInput,
  ): Promise<TokenResponse> {
    return this.passwordAuthService.userLogin(request);
  }

  @Mutation('passwordSignup')
  @UsePipes(new ValidationPipe(UserPasswordSignupInputSchema))
  async passwordSignup(@Args('input') request: any): Promise<UserSignupResponse> {
    return this.passwordAuthService.userSignup(request);
  }

  @Mutation('otpLogin')
  @UsePipes(new ValidationPipe(UserOTPLoginInputSchema))
  async otpLogin(
    @Args('input') request: UserLoginInput,
  ): Promise<TokenResponse> {
    return this.otpAuthService.userLogin(request);
  }

  @Mutation('otpSignup')
  @UsePipes(new ValidationPipe(UserOTPSignupInputSchema))
  async otpSignup(@Args('input') request: any): Promise<UserSignupResponse> {
    return this.otpAuthService.userSignup(request);
  }

  @Mutation('changePassword')
  @UseGuards(AuthGuard)
  async changeUserPassword(
    @Args('input', new ValidationPipe(UserPasswordInputSchema)) request: any,
    @Context('user') user: any,
  ): Promise<User> {
    return this.passwordAuthService.updatePassword(user.id, request);
  }

  @Mutation('refresh')
  async refresh(
    @Args('input') request: RefreshTokenInput,
  ): Promise<TokenResponse> {
    return this.tokenService.refresh(request.refreshToken);
  }

  @Mutation('logout')
  @UseGuards(AuthGuard)
  async logout(@Context('user') user: any): Promise<void> {
    return this.tokenService.resetToken(user.id);
  }

  @Mutation('generateOtp')
  @UsePipes(new ValidationPipe(GenerateOtpInputSchema))
  async generateOtp(@Args('input') request: GenerateOtpInput) {
    return this.otpAuthService.sendOTP(request.phone);
  }

  // @Mutation('enable2FA')
  // @UseGuards(AuthGuard)
  // async enable2FA(
  //   @Args('input', new ValidationPipe(Enable2FAInputSchema))
  //   request: Enable2FAInput,
  //   @Context('user') user: any,
  // ) {
  //   return await this.userAuthService.enable2FA(request.code, user.id);
  // }
}
