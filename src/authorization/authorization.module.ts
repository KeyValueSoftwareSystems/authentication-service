import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationHelper } from '../authentication/authentication.helper';
import { RedisCacheModule } from '../cache/redis-cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache/redis-cache.service';
import EntityModel from './entity/entity.entity';
import EntityPermission from './entity/entityPermission.entity';
import Group from './entity/group.entity';
import GroupPermission from './entity/groupPermission.entity';
import GroupRole from './entity/groupRole.entity';
import Permission from './entity/permission.entity';
import Role from './entity/role.entity';
import RolePermission from './entity/rolePermission.entity';
import User from './entity/user.entity';
import UserGroup from './entity/userGroup.entity';
import UserPermission from './entity/userPermission.entity';
import { EntityRepository } from './repository/entity.repository';
import { GroupRepository } from './repository/group.repository';
import { GroupPermissionRepository } from './repository/groupPermission.repository';
import { GroupRoleRepository } from './repository/groupRole.repository';
import { PermissionRepository } from './repository/permission.repository';
import { RoleRepository } from './repository/role.repository';
import { RolePermissionRepository } from './repository/rolePermission.repository';
import { UserRepository } from './repository/user.repository';
import { UserPermissionRepository } from './repository/userPermission.repository';
import { EntityResolver } from './resolver/entity.resolver';
import { GroupResolver } from './resolver/group.resolver';
import { PermissionResolver } from './resolver/permission.resolver';
import { RoleResolver } from './resolver/role.resolver';
import { UserResolver } from './resolver/user.resolver';
import { EntityService } from './service/entity.service';
import { GroupService } from './service/group.service';
import GroupCacheService from './service/groupcache.service';
import { PermissionService } from './service/permission.service';
import PermissionCacheService from './service/permissioncache.service';
import { RoleService } from './service/role.service';
import RoleCacheService from './service/rolecache.service';
import SearchService from './service/search.service';
import UserService from './service/user.service';
import UserCacheService from './service/usercache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Permission,
      User,
      UserGroup,
      UserPermission,
      GroupPermission,
      EntityModel,
      EntityPermission,
      Role,
      GroupRole,
      RolePermission,
    ]),
    RedisCacheModule,
  ],
  providers: [
    GroupResolver,
    GroupService,
    PermissionService,
    EntityService,
    PermissionResolver,
    PermissionCacheService,
    UserService,
    UserResolver,
    EntityResolver,
    RedisCacheService,
    UserCacheService,
    GroupCacheService,
    AuthenticationHelper,
    ConfigService,
    RoleResolver,
    RoleService,
    RoleCacheService,
    SearchService,
    PermissionRepository,
    UserPermissionRepository,
    GroupPermissionRepository,
    RoleRepository,
    RolePermissionRepository,
    GroupRoleRepository,
    EntityRepository,
    GroupRepository,
    UserRepository,
  ],
  exports: [UserService],
})
export class AuthorizationModule {}
