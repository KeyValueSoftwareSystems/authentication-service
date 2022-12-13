import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../schema/graphql.schema';
import { PermissionsType } from '../constants/authorization.constants';
import Permission from '../entity/permission.entity';
import { Permissions } from '../permissions.decorator';
import { PermissionService } from '../service/permission.service';

@Resolver('Permission')
export class PermissionResolver {
  constructor(private permissionService: PermissionService) {}

  @Permissions(PermissionsType.ViewPermissions)
  @Query()
  getPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Permissions(PermissionsType.ViewPermissions)
  @Query()
  getPermission(@Args('id', ParseUUIDPipe) id: string): Promise<Permission> {
    return this.permissionService.getPermissionById(id);
  }

  @Permissions(PermissionsType.CreatePermissions)
  @Mutation()
  async createPermission(
    @Args('input') userInput: NewPermissionInput,
  ): Promise<Permission> {
    return this.permissionService.createPermission(userInput);
  }

  @Permissions(PermissionsType.EditPermissions)
  @Mutation()
  async updatePermission(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') userInput: UpdatePermissionInput,
  ): Promise<Permission> {
    return this.permissionService.updatePermission(id, userInput);
  }

  @Permissions(PermissionsType.DeletePermissions)
  @Mutation()
  async deletePermission(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission> {
    return this.permissionService.deletePermission(id);
  }
}
