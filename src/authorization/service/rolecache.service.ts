import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RolePermission from '../entity/rolePermission.entity';
import Role from '../entity/role.entity';
import { RoleRepository } from '../repository/role.repository';
import { RolePermissionRepository } from '../repository/rolePermission.repository';

@Injectable()
export default class RoleCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: RolePermissionRepository,
    @InjectRepository(Role)
    private roleRepository: RoleRepository,
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
          .then(() => this.rolePermissionRepository.findByRoleId(roleId))
      ).map((rolePermission) => rolePermission.permissionId);
    permissionsFromCache ||
      (await this.cacheManager.set(`ROLE:${roleId}:PERMISSIONS`, permissions));
    return permissionsFromCache || permissions;
  }

  async invalidateRolePermissionsByRoleId(id: string) {
    this.cacheManager.del(`ROLE:${id}:PERMISSIONS`);
  }
}
