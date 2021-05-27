import { UsePipes } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  NewUserInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  User,
} from '../../schema/graphql.schema';
import UserService from '../service/user.service';
import ValidationPipe from '../../validation/validation.pipe';
import * as UserSchema from '../validation/user.validation.schema';
import Permission from '../entity/permission.entity';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query()
  getUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Query()
  getUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Mutation()
  @UsePipes(new ValidationPipe(UserSchema.CreateUserSchema))
  async createUser(@Args('input') userInput: NewUserInput): Promise<User> {
    return this.userService.createUser(userInput);
  }

  @Mutation()
  async updateUser(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input', new ValidationPipe(UserSchema.UpdateUserSchema))
    userInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(id, userInput);
  }

  @Mutation()
  async updateUserPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input')
    userInput: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    return this.userService.updateUserPermissions(id, userInput);
  }

  @Mutation()
  async deleteUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
