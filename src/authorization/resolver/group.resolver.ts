import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthGaurd } from 'src/authentication/authentication.gaurd';
import {
  NewGroupInput,
  Permission,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import { GroupService } from '../service/group.service';

@Resolver('Group')
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @UseGuards(AuthGaurd)
  @Query()
  getGroups(): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  @UseGuards(AuthGaurd)
  @Query()
  getGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.getGroupById(id);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async createGroup(@Args('input') groupInput: NewGroupInput): Promise<Group> {
    return this.groupService.createGroup(groupInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async updateGroup(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupInput,
  ): Promise<Group> {
    return this.groupService.updateGroup(id, groupInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async updateGroupPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    return this.groupService.updateGroupPermissions(id, groupInput);
  }

  @UseGuards(AuthGaurd)
  @Mutation()
  async deleteGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.deleteGroup(id);
  }

  @UseGuards(AuthGaurd)
  @Query()
  async getGroupPermissions(@Args('id', ParseUUIDPipe) id: string): Promise<Permission[]> {
    return this.groupService.getGroupPermissions(id);
  }
}
