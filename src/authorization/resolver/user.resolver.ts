import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  User,
  Group,
  Permission,
  UserPermissionsVerification,
  OperationType,
  FilterUserInput,
} from '../../schema/graphql.schema';
import UserService from '../service/user.service';
import ValidationPipe from '../../validation/validation.pipe';
import * as UserSchema from '../validation/user.validation.schema';
import { Permissions } from '../permissions.decorator';
import { PermissionsType } from '../constants/authorization.constants';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Permissions(PermissionsType.ViewUser)
  @Query()
  getUsers(@Args('input') input: FilterUserInput): Promise<User[]> {
    return this.userService.getAllUsers(input);
  }

  @Permissions(PermissionsType.ViewUser)
  @Query()
  getUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Permissions(PermissionsType.EditUser)
  @Mutation()
  async updateUser(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input', new ValidationPipe(UserSchema.UpdateUserSchema))
    userInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(id, userInput);
  }

  @Permissions(PermissionsType.EditUser)
  @Mutation()
  async updateUserGroups(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input')
    userInput: UpdateUserGroupInput,
  ): Promise<Group[]> {
    return this.userService.updateUserGroups(id, userInput);
  }

  @Permissions(PermissionsType.EditUser)
  @Mutation()
  async updateUserPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input')
    userInput: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    return this.userService.updateUserPermissions(id, userInput);
  }

  @Permissions(PermissionsType.DeleteUser)
  @Mutation()
  async deleteUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }

  @Permissions(PermissionsType.ViewUser)
  @Query()
  async verifyUserPermission(
    @Args('params')
    params: UserPermissionsVerification,
    @Context('user') user: any,
  ) {
    return this.userService.verifyUserPermissions(
      user.id,
      params.permissions,
      params.operation || OperationType.AND,
    );
  }

  @Permissions(PermissionsType.ViewUser)
  @Query()
  async getUserPermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.userService.getUserPermissions(id);
  }

  @Permissions(PermissionsType.ViewUser)
  @Query()
  async getUserGroups(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.userService.getUserGroups(id);
  }
}
