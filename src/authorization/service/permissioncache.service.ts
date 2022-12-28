import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import Permission from '../entity/permission.entity';
import { PermissionRepository } from '../repository/permission.repository';

@Injectable()
export default class PermissionCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    private permissionsRepository: PermissionRepository,
  ) {}

  async getPermissionsFromCache(
    permissionName: string,
  ): Promise<{ id: string; name: string }> {
    const permissionsFromCache = await this.cacheManager.get<Permission>(
      `PERMISSION:${permissionName}`,
    );
    const permission = permissionsFromCache
      ? permissionsFromCache
      : await this.permissionsRepository.findOneOrFail({
          where: { name: permissionName },
        });
    permissionsFromCache ||
      (await this.cacheManager.set(`PERMISSION:${permissionName}`, permission));
    return permission;
  }

  async invalidatePermissionsCache(name: string) {
    this.cacheManager.del(`PERMISSION:${name}`);
  }
}
