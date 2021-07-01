import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import { createQueryBuilder, Repository } from 'typeorm';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import Permission from '../entity/permission.entity';
import UserGroup from '../entity/userGroup.entity';
import {
  GroupNotFoundException,
  GroupDeleteNotAllowedException,
} from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import GroupCacheService from './groupcache.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private groupCacheService: GroupCacheService,
  ) {}

  getAllGroups(): Promise<Group[]> {
    return this.groupsRepository.find({ where: { active: true } });
  }

  async getGroupById(id: string): Promise<Group> {
    const group = await this.groupsRepository.findOne(id, {
      where: { active: true },
    });
    if (group) {
      return group;
    }
    throw new GroupNotFoundException(id);
  }

  async createGroup(group: NewGroupInput): Promise<Group> {
    const newGroup = await this.groupsRepository.create(group);
    await this.groupsRepository.save(newGroup);
    return newGroup;
  }

  async updateGroup(id: string, group: UpdateGroupInput): Promise<Group> {
    const groupToUpdate = this.groupsRepository.create(group);
    await this.groupsRepository.update(id, groupToUpdate);
    const updatedGroup = await this.groupsRepository.findOne(id);
    if (updatedGroup) {
      return updatedGroup;
    }
    throw new GroupNotFoundException(id);
  }

  async deleteGroup(id: string): Promise<Group> {
    const usage = await this.checkGroupUsage(id);
    if (usage) {
      throw new GroupDeleteNotAllowedException(id);
    }
    await this.groupsRepository.update(id, { active: false });
    const deletedGroup = await this.groupsRepository.findOne(id);
    if (deletedGroup) {
      await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
      return deletedGroup;
    }
    throw new GroupNotFoundException(id);
  }

  async updateGroupPermissions(
    id: string,
    request: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    const updatedGroup = await this.groupsRepository.findOne(id);
    if (!updatedGroup) {
      throw new GroupNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.findByIds(
      request.permissions,
    );
    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }
    const groupPermission = this.groupPermissionRepository.create(
      request.permissions.map((permission) => ({
        groupId: id,
        permissionId: permission,
      })),
    );
    const savedGroupPermissions = await this.groupPermissionRepository.save(
      groupPermission,
    );
    const permissions = await this.permissionRepository.findByIds(
      savedGroupPermissions.map((g) => g.permissionId),
    );
    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return permissions;
  }

  async getGroupPermissions(id: string): Promise<Permission[]> {
    const permissions = await createQueryBuilder<Permission>('permission')
      .leftJoinAndSelect(
        GroupPermission,
        'groupPermission',
        'Permission.id = groupPermission.permissionId',
      )
      .where('groupPermission.groupId = :groupId', { groupId: id })
      .getMany();
    return permissions;
  }

  private async checkGroupUsage(id: string) {
    const userCount = await this.userGroupRepository.count({
      where: { groupId: id },
    });
    return userCount != 0;
  }
}
