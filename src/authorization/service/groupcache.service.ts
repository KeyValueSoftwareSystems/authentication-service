import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { GroupRepository } from '../repository/group.repository';
import { GroupPermissionRepository } from '../repository/groupPermission.repository';
import { GroupRoleRepository } from '../repository/groupRole.repository';

@Injectable()
export default class GroupCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    private groupPermissionRepository: GroupPermissionRepository,
    private groupRoleRepository: GroupRoleRepository,
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
            this.groupPermissionRepository.getGroupPermissionsForGroupId(
              groupId,
            ),
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
