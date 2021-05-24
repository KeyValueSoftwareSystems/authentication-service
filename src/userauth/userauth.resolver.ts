import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { TokenResponse, UserSignupResponse } from 'src/schema/graphql.schema';
import User from 'src/user/user.entity';
import { AuthGaurd } from './userauth.gaurd';
import { UserauthService } from './userauth.service';

@Resolver('Userauth')
export class UserauthResolver {
  constructor(private readonly userauthService: UserauthService) {}

  @Mutation('login')
  async userLogin(@Args('input') request: any): Promise<TokenResponse> {
    return this.userauthService.userLogin(request);
  }

  @Mutation('signup')
  async userSignup(@Args('input') request: any): Promise<UserSignupResponse> {
    return this.userauthService.userSignup(request);
  }

  //TODO: Remove sample method for validating auth service
  @Query('me')
  @UseGuards(new AuthGaurd())
  async me(@Context('user') user: any) {
    return this.userauthService.getUserDetailsByEmailOrPhone(user.username);
  }

  @Mutation('changePassword')
  @UseGuards(new AuthGaurd())
  async changeUserPassword(
    @Args('input') request: any,
    @Context('user') user: any,
  ): Promise<User> {
    return this.userauthService.updatePassword(user.username, request);
  }
}