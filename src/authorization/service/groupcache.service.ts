import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import GroupPermission from '../entity/groupPermission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Group from '../entity/group.entity';
import GroupRole from '../entity/groupRole.entity';

@Injectable()
export default class GroupCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async getGroupPermissionsFromGroupId(groupId: string): Promise<string[]> {
    const permissionsFromCache = await this.cacheManager.get<string[]>(
      `GROUP:${groupId}:PERMISSIONS`,
    );
    const permissions =
      permissionsFromCache ||
      (
        await this.groupRepository
          .findOneOrFail({ where: { id: groupId } })
          .then(() =>
            this.groupPermissionRepository.find({
              where: { groupId: groupId },
            }),
          )
      ).map((x) => x.permissionId);
    permissionsFromCache ||
      (await this.cacheManager.set(
        `GROUP:${groupId}:PERMISSIONS`,
        permissions,
      ));
    return permissionsFromCache || permissions;
  }

  async invalidateGroupPermissionsByGroupId(id: string) {
    this.cacheManager.del(`GROUP:${id}:PERMISSIONS`);
  }

  async getGroupRolesFromGroupId(groupId: string): Promise<string[]> {
    const rolesFromCache = await this.cacheManager.get<string[]>(
      `GROUP:${groupId}:ROLES`,
    );
    const roles =
      rolesFromCache ||
      (
        await this.groupRepository
          .findOneOrFail({ where: { id: groupId } })
          .then(() =>
            this.groupRoleRepository.find({
              where: { groupId: groupId },
            }),
          )
      ).map((groupRole) => groupRole.roleId);
    rolesFromCache ||
      (await this.cacheManager.set(`GROUP:${groupId}:ROLES`, roles));
    return rolesFromCache || roles;
  }

  async invalidateGroupRolesByGroupId(id: string) {
    this.cacheManager.del(`GROUP:${id}:ROLES`);
  }
}
