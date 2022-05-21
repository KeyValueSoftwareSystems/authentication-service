import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  NewRoleInput,
  Permission,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import Role from '../entity/role.entity';
import { RoleService } from '../service/role.service';
import { Permissions } from '../permissions.decorator';
import { PermissionsType } from '../constants/authorization.constants';

@Resolver('Role')
export class RoleResolver {
  constructor(private roleService: RoleService) {}

  @Permissions(PermissionsType.ViewRoles)
  @Query()
  getRoles(): Promise<Role[]> {
    return this.roleService.getAllRoles();
  }

  @Permissions(PermissionsType.ViewRoles)
  @Query()
  getRole(@Args('id', ParseUUIDPipe) id: string): Promise<Role> {
    return this.roleService.getRoleById(id);
  }

  @Permissions(PermissionsType.CreateRoles)
  @Mutation()
  async createRole(@Args('input') roleInput: NewRoleInput): Promise<Role> {
    return this.roleService.createRole(roleInput);
  }

  @Permissions(PermissionsType.EditRoles)
  @Mutation()
  async updateRole(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') roleInput: UpdateRoleInput,
  ): Promise<Role> {
    return this.roleService.updateRole(id, roleInput);
  }

  @Permissions(PermissionsType.EditRoles)
  @Mutation()
  async updateRolePermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') roleInput: UpdateRolePermissionInput,
  ): Promise<Permission[]> {
    return this.roleService.updateRolePermissions(id, roleInput);
  }

  @Permissions(PermissionsType.DeleteRoles)
  @Mutation()
  async deleteRole(@Args('id', ParseUUIDPipe) id: string): Promise<Role> {
    return this.roleService.deleteRole(id);
  }

  @Permissions(PermissionsType.ViewRoles)
  @Query()
  async getRolePermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.roleService.getRolePermissions(id);
  }
}
