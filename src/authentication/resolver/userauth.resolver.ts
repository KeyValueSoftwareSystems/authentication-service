import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { TokenResponse, UserSignupResponse } from 'src/schema/graphql.schema';
import User from 'src/authorization/entity/user.entity';
import ValidationPipe from 'src/validation/validation.pipe';
import { AuthGaurd } from '../authentication.gaurd';
import { UserauthService } from '../service/userauth.service';
import {
  UserLoginInputSchema,
  UserPasswordInputSchema,
  UserSignupInputSchema,
} from '../validation/userauthschema.validation';

@Resolver('Userauth')
export class UserauthResolver {
  constructor(private readonly userauthService: UserauthService) {}

  @Mutation('login')
  @UsePipes(new ValidationPipe(UserLoginInputSchema))
  async userLogin(@Args('input') request: any): Promise<TokenResponse> {
    return this.userauthService.userLogin(request);
  }

  @Mutation('signup')
  @UsePipes(new ValidationPipe(UserSignupInputSchema))
  async userSignup(@Args('input') request: any): Promise<UserSignupResponse> {
    return this.userauthService.userSignup(request);
  }

  @Mutation('changePassword')
  @UseGuards(AuthGaurd)
  async changeUserPassword(
    @Args('input', new ValidationPipe(UserPasswordInputSchema)) request: any,
    @Context('user') user: any,
  ): Promise<User> {
    return this.userauthService.updatePassword(user.username, request);
  }
}
