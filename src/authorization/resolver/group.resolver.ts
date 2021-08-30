import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthGuard } from '../../authentication/authentication.guard';
import {
  NewGroupInput,
  Permission,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import Group from '../entity/group.entity';
import { GroupService } from '../service/group.service';

@Resolver('Group')
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @UseGuards(AuthGuard)
  @Query()
  getGroups(): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  @UseGuards(AuthGuard)
  @Query()
  getGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.getGroupById(id);
  }

  @UseGuards(AuthGuard)
  @Mutation()
  async createGroup(@Args('input') groupInput: NewGroupInput): Promise<Group> {
    return this.groupService.createGroup(groupInput);
  }

  @UseGuards(AuthGuard)
  @Mutation()
  async updateGroup(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupInput,
  ): Promise<Group> {
    return this.groupService.updateGroup(id, groupInput);
  }

  @UseGuards(AuthGuard)
  @Mutation()
  async updateGroupPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') groupInput: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    return this.groupService.updateGroupPermissions(id, groupInput);
  }

  @UseGuards(AuthGuard)
  @Mutation()
  async deleteGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
    return this.groupService.deleteGroup(id);
  }

  @UseGuards(AuthGuard)
  @Query()
  async getGroupPermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.groupService.getGroupPermissions(id);
  }
}
