import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheService } from 'src/cache/redis-cache/redis-cache.service';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import { Repository } from 'typeorm';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import Permission from '../entity/permission.entity';
import { GroupNotFoundException } from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private cacheManager: RedisCacheService,
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
    await this.groupsRepository.update(id, { active: false });
    const deletedGroup = await this.groupsRepository.findOne(id);
    if (deletedGroup) {
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
    this.cacheManager.del(`GROUP:${id}:PERMISSIONS`);
    return permissions;
  }

  async getGroupPermissions(id: string): Promise<Permission[]> {
    const groupPermissions = await this.groupPermissionRepository.find({where: {groupId: id}});
    const permissions = this.permissionRepository.findByIds(groupPermissions.map(p => p.permissionId));
    return permissions;
  }
}
