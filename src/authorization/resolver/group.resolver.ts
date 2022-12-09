import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, ResolveField } from '@nestjs/graphql';
import {
  GroupInputFilter,
  NewGroupInput,
  Permission,
  Role,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
} from '../../schema/graphql.schema';
import Group from '../entity/group.entity';
import { GroupService } from '../service/group.service';
import { Permissions } from '../permissions.decorator';
import { PermissionsType } from '../constants/authorization.constants';

@Resolver('Group')
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  getGroups(@Args('input') input: GroupInputFilter): Promise<Group[]> {
    return this.groupService.getAllGroups(input);
  }

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  getGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.getGroupById(id);
  }

  @ResolveField('users')
  async getUsersByGroup(group: Group) {
    if (group.id) {
      return this.groupService.getGroupUsers(group.id);
    }
  }

  @Permissions(PermissionsType.CreateGroups)
  @Mutation()
  async createGroup(@Args('input') groupInput: NewGroupInput): Promise<Group> {
    return this.groupService.createGroup(groupInput);
  }

  @Permissions(PermissionsType.EditGroups)
  @Mutation()
  async updateGroup(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupInput,
  ): Promise<Group> {
    return this.groupService.updateGroup(id, groupInput);
  }

  @Permissions(PermissionsType.EditGroups)
  @Mutation()
  async updateGroupPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    return this.groupService.updateGroupPermissions(id, groupInput);
  }

  @Permissions(PermissionsType.DeleteGroups)
  @Mutation()
  async deleteGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.deleteGroup(id);
  }

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  async getGroupPermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.groupService.getGroupPermissions(id);
  }

  @Permissions(PermissionsType.EditGroups)
  @Mutation()
  async updateGroupRoles(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupRoleInput,
  ): Promise<Role[]> {
    return this.groupService.updateGroupRoles(id, groupInput);
  }

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  async getGroupRoles(@Args('id', ParseUUIDPipe) id: string): Promise<Role[]> {
    return this.groupService.getGroupRoles(id);
  }

  @ResolveField('roles')
  async getRolesOfGroup(group: Group) {
    if (group.id) {
      return this.groupService.getGroupRoles(group.id);
    }
  }

  @ResolveField('permissions')
  async getDirectGroupPermissions(group: Group) {
    if (group.id) {
      return this.groupService.getGroupPermissions(group.id);
    }
  }

  @ResolveField('allPermissions')
  async getAllGroupPermissions(group: Group) {
    if (group.id) {
      return this.groupService.getAllGroupPermissions(group.id);
    }
  }
}
