import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import RolePermission from '../entity/rolePermission.entity';
import Role from '../entity/role.entity';
import { RoleCacheServiceInterface } from './rolecache.service.interface';

@Injectable()
export default class RoleCacheService implements RoleCacheServiceInterface {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getRolePermissionsFromRoleId(roleId: string): Promise<string[]> {
    const permissionsFromCache = await this.cacheManager.get<string[]>(
      `ROLE:${roleId}:PERMISSIONS`,
    );
    const permissions =
      permissionsFromCache ||
      (
        await this.roleRepository
          .findOneOrFail({ where: { id: roleId } })
          .then(() =>
            this.rolePermissionRepository.find({
              where: { roleId: roleId },
            }),
          )
      ).map((rolePermission) => rolePermission.permissionId);
    permissionsFromCache ||
      (await this.cacheManager.set(`ROLE:${roleId}:PERMISSIONS`, permissions));
    return permissionsFromCache || permissions;
  }

  async invalidateRolePermissionsByRoleId(id: string) {
    this.cacheManager.del(`ROLE:${id}:PERMISSIONS`);
  }
}
