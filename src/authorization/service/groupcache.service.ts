import User from '../entity/user.entity';
import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import GroupPermission from '../entity/groupPermission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class GroupCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
  ) {}

  async getGroupPermissionsFromGroupId(groupId: string): Promise<string[]> {
    const permissionsFromCache = await this.cacheManager.get<string[]>(
      `GROUP:${groupId}:PERMISSIONS`,
    );
    const permissions =
      permissionsFromCache ||
      (
        await this.groupPermissionRepository.find({
          where: { groupId: groupId },
        })
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
}
