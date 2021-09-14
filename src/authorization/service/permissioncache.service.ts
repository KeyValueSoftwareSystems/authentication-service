import { RedisCacheService } from '../../common/cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Permission from '../entity/permission.entity';

@Injectable()
export default class PermissionCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
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
