import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import GroupRole from '../entity/groupRole.entity';
import { GroupRepository } from '../repository/group.repository';
import { GroupPermissionRepository } from '../repository/groupPermission.repository';
import { GroupRoleRepository } from '../repository/groupRole.repository';

@Injectable()
export default class GroupCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: GroupPermissionRepository,
    @InjectRepository(GroupRole)
    private groupRoleRepository: GroupRoleRepository,
    @InjectRepository(Group)
    private groupRepository: GroupRepository,
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
              where: { groupId },
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
          .then(() => this.groupRoleRepository.getGroupRolesForGroupId(groupId))
      ).map((groupRole) => groupRole.roleId);
    rolesFromCache ||
      (await this.cacheManager.set(`GROUP:${groupId}:ROLES`, roles));
    return rolesFromCache || roles;
  }

  async invalidateGroupRolesByGroupId(id: string) {
    this.cacheManager.del(`GROUP:${id}:ROLES`);
  }
}
