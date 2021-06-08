import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheService } from 'src/cache/redis-cache/redis-cache.service';
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
import { GroupNotFoundException, GroupDeleteNotAllowedException } from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import {getConnection} from "typeorm";

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
    if(this.checkGroupUsage(id)) {
      throw new GroupDeleteNotAllowedException(id)
    }
    getConnection().manager.transaction(async entityManager => {
      const groupPermissionsRepo = entityManager.getRepository(GroupPermission);
      groupPermissionsRepo.delete({groupId: id});
      this.groupsRepository.update(id, { active: false }, );
    });
    const deletedGroup = await this.groupsRepository.findOne(id);
    if (deletedGroup) {
      await this.cacheManager.del(`GROUP:${id}:PERMISSIONS`);
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

    const permissions = await createQueryBuilder<Permission>("permission").
    leftJoinAndSelect(GroupPermission, "groupPermission", "Permission.id = groupPermission.permissionId").
    where("groupPermission.groupId = :groupId", {groupId: id}).
    getMany();
    return permissions;
  }

  private async checkGroupUsage(id: string){
    const userCount = await this.userGroupRepository.count({where: {groupId: id}});
    return userCount != 0
  }
}
