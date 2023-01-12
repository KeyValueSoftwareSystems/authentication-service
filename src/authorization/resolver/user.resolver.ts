import { Inject, UseGuards } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthGuard } from '../../authentication/authentication.guard';
import {
  Group,
  OperationType,
  Permission,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  User,
  UserInputFilter,
  UserPaginated,
  UserPermissionsVerification,
} from '../../schema/graphql.schema';
import ValidationPipe from '../../validation/validation.pipe';
import { PermissionsType } from '../constants/authorization.constants';
import { Permissions } from '../permissions.decorator';
import { UserServiceInterface } from '../service/user.service.interface';
import * as UserSchema from '../validation/user.validation.schema';

@Resolver('User')
export class UserResolver {
  constructor(
    @Inject(UserServiceInterface) private userService: UserServiceInterface,
  ) {}

  @Permissions(PermissionsType.ViewUser)
  @Query()
  async getUsers(
    @Args('input') input: UserInputFilter,
  ): Promise<UserPaginated> {
    const [users, count] = await this.userService.getAllUsers(input);
    return { totalCount: count, results: users };
  }

  @Permissions(PermissionsType.ViewUser)
  @Query()
  getUser(@Args('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGuard)
  @Query()
  getCurrentUser(@Context('user') user: any): Promise<User> {
    return this.userService.getUserById(user.id);
  }

  @ResolveField('groups')
  async getUserGroupResolveField(user: User) {
    if (user.id) {
      return this.userService.getUserGroups(user.id);
    }
  }

  @ResolveField('permissions')
  async getUserPermissionResolveField(user: User) {
    if (user.id) {
      return this.userService.permissionsOfUser(user.id);
    }
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

  @UseGuards(AuthGuard)
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
