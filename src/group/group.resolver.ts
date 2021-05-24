import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { NewGroupInput, UpdateGroupInput } from 'src/schema/graphql.schema';
import Group from './group.entity';
import { GroupService } from './group.service';

@Resolver('Group')
export class GroupResolver {
    constructor(private groupService: GroupService) {}
  
    @Query()
    getGroups(): Promise<Group[]> {
      return this.groupService.getAllGroups();
    }
  
    @Query()
    getGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
      return this.groupService.getGroupById(id);
    }
  
    @Mutation()
    async createGroup(@Args('input') groupInput: NewGroupInput): Promise<Group> {
      return this.groupService.createGroup(groupInput);
    }
  
    @Mutation()
    async updateGroup(
      @Args('id', ParseUUIDPipe) id: string,
      @Args('input') groupInput: UpdateGroupInput,
    ): Promise<Group> {
      return this.groupService.updateGroup(id, groupInput);
    }
  
    @Mutation()
    async deleteGroup(@Args('id', ParseUUIDPipe) id: string): Promise<Group> {
      return this.groupService.deleteGroup(id);
    }
}
