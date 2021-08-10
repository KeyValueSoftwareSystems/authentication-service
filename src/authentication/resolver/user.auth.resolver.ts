import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import {
  GenerateOtpInput,
  RefreshTokenInput,
  TokenResponse,
  UserLoginInput,
  UserSignupResponse,
} from 'src/schema/graphql.schema';
import User from 'src/authorization/entity/user.entity';
import { AuthGuard } from '../authentication.guard';
import UserAuthService from '../service/user.auth.service';
import {
  EnableUser2FASchema,
  GenerateOtpInputSchema,
  UserLoginInputSchema,
  UserPasswordInputSchema,
  UserSignupInputSchema,
} from '../validation/user.auth.schema.validation';
import ValidationPipe from '../../validation/validation.pipe';

@Resolver('Userauth')
export default class UserAuthResolver {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Mutation('login')
  @UsePipes(new ValidationPipe(UserLoginInputSchema))
  async userLogin(
    @Args('input') request: UserLoginInput,
  ): Promise<TokenResponse> {
    return this.userAuthService.userLogin(request);
  }

  @Mutation('signup')
  @UsePipes(new ValidationPipe(UserSignupInputSchema))
  async userSignup(@Args('input') request: any): Promise<UserSignupResponse> {
    return this.userAuthService.userSignup(request);
  }

  @Mutation('changePassword')
  @UseGuards(AuthGuard)
  async changeUserPassword(
    @Args('input', new ValidationPipe(UserPasswordInputSchema)) request: any,
    @Context('user') user: any,
  ): Promise<User> {
    return this.userAuthService.updatePassword(user.id, request);
  }

  @Mutation('refresh')
  async refresh(
    @Args('input') request: RefreshTokenInput,
  ): Promise<TokenResponse> {
    return this.userAuthService.refresh(request.refreshToken);
  }

  @Mutation('logout')
  @UseGuards(AuthGuard)
  async logout(@Context('user') user: any): Promise<void> {
    return this.userAuthService.logout(user.id);
  }

  @Mutation('generateOtp')
  @UsePipes(new ValidationPipe(GenerateOtpInputSchema))
  async generateOtp(@Args('input') request: GenerateOtpInput) {
    return this.userAuthService.generateOtpAndSendMessage(request.phone);
  }
}
