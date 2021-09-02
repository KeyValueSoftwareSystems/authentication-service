import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import {
  NewGroupInput,
  Permission,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import Group from '../entity/group.entity';
import { GroupService } from '../service/group.service';
import { Permissions } from '../permissions.decorator';
import { PermissionsType } from '../constants/authorization.constants';

@Resolver('Group')
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  getGroups(): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  @Permissions(PermissionsType.ViewGroups)
  @Query()
  getGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.getGroupById(id);
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
}
