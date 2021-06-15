import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  User,
  Group,
  Permission,
  UserPermissionsVerification,
  OperationType,
} from '../../schema/graphql.schema';
import UserService from '../service/user.service';
import ValidationPipe from '../../validation/validation.pipe';
import * as UserSchema from '../validation/user.validation.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGaurd } from '../../authentication/authentication.gaurd';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGaurd)
  @Query()
  getUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(AuthGaurd)
  @Query()
  getUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async updateUser(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input', new ValidationPipe(UserSchema.UpdateUserSchema))
    userInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(id, userInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async updateUserGroups(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input')
    userInput: UpdateUserGroupInput,
  ): Promise<Group[]> {
    return this.userService.updateUserGroups(id, userInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async updateUserPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input')
    userInput: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    return this.userService.updateUserPermissions(id, userInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async deleteUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }

  @UseGuards(AuthGaurd)
  @Query()
  async verifyUserPermission(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('params')
    params: UserPermissionsVerification,
  ) {
    return this.userService.verifyUserPermissions(
      id,
      params.permissions,
      params.operation || OperationType.AND,
    );
  }

  @UseGuards(AuthGaurd)
  @Query()
  async getUserPermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.userService.getUserPermissions(id);
  }

  @UseGuards(AuthGaurd)
  @Query()
  async getUserGroups(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.userService.getUserGroups(id);
  }
}
