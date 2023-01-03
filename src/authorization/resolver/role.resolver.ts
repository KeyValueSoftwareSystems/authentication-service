import { Inject, ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, ResolveField } from '@nestjs/graphql';
import {
  NewRoleInput,
  Permission,
  RoleInputFilter,
  RolePaginated,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import Role from '../entity/role.entity';
import { Permissions } from '../permissions.decorator';
import { PermissionsType } from '../constants/authorization.constants';
import { RoleServiceInterface } from '../service/role.service.interface';

@Resolver('Role')
export class RoleResolver {
  constructor(
    @Inject(RoleServiceInterface) private roleService: RoleServiceInterface,
  ) {}

  @Permissions(PermissionsType.ViewRoles)
  @Query()
  async getRoles(
    @Args('input') input: RoleInputFilter,
  ): Promise<RolePaginated> {
    const [results, totalCount] = await this.roleService.getAllRoles(input);
    return { totalCount, results };
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

  @ResolveField('permissions')
  async getRolePermission(role: Role) {
    if (role.id) {
      return this.roleService.getRolePermissions(role.id);
    }
  }
}
