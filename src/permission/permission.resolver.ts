import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';
import Permission from './permission.entity';
import { PermissionService } from './permission.service';

@Resolver('Permission')
export class PermissionResolver {
  constructor(private permissionService: PermissionService) {}

  @Query()
  getPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Query()
  getPermission(@Args('id', ParseUUIDPipe) id: string): Promise<Permission> {
    return this.permissionService.getPermissionById(id);
  }

  @Mutation()
  async createPermission(
    @Args('input') userInput: NewPermissionInput,
  ): Promise<Permission> {
    console.log('permission save started');
    return this.permissionService.createPermission(userInput);
  }

  @Mutation()
  async updatePermission(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') userInput: UpdatePermissionInput,
  ): Promise<Permission> {
    return this.permissionService.updatePermission(id, userInput);
  }

  @Mutation()
  async deletePermission(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission> {
    return this.permissionService.deletePermission(id);
  }
}
