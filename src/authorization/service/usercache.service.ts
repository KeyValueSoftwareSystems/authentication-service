import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserGroup from '../entity/userGroup.entity';
import UserPermission from '../entity/userPermission.entity';
import User from '../entity/user.entity';

@Injectable()
export default class UserCacheService {
  constructor(
    private cacheManager: RedisCacheService,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserGroupsByUserId(userId: string): Promise<string[]> {
    const groupsFromCache = await this.cacheManager.get<string[]>(
      `USER:${userId}:GROUPS`,
    );
    const groups =
      groupsFromCache ||
      (
        await this.userRepository
          .findOneOrFail({ where: { id: userId } })
          .then(() =>
            this.userGroupRepository.find({ where: { userId: userId } }),
          )
      ).map((x) => x.groupId);
    groupsFromCache ||
      (await this.cacheManager.set(`USER:${userId}:GROUPS`, groups));
    return groupsFromCache || groups;
  }

  async getUserPermissionsByUserId(userId: string): Promise<string[]> {
    const permissionsFromCache = await this.cacheManager.get<string[]>(
      `USER:${userId}:PERMISSIONS`,
    );
    const permissions =
      permissionsFromCache ||
      (
        await this.userRepository
          .findOneOrFail({ where: { id: userId } })
          .then(() =>
            this.userPermissionRepository.find({ where: { userId: userId } }),
          )
      ).map((x) => x.permissionId);
    permissionsFromCache ||
      (await this.cacheManager.set(`USER:${userId}:PERMISSIONS`, permissions));
    return permissionsFromCache || permissions;
  }

  async invalidateUserPermissionsCache(userId: string) {
    await this.cacheManager.del(`USER:${userId}:PERMISSIONS`);
  }

  async invalidateUserGroupsCache(userId: string) {
    await this.cacheManager.del(`USER:${userId}:GROUPS`);
  }
}
