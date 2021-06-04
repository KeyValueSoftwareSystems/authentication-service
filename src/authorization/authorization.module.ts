import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationHelper } from 'src/authentication/authentication.helper';
import { RedisCacheModule } from 'src/cache/redis-cache/redis-cache.module';
import { RedisCacheService } from 'src/cache/redis-cache/redis-cache.service';
import EntityModel from './entity/entity.entity';
import EntityPermission from './entity/entityPermission.entity';
import Group from './entity/group.entity';
import GroupPermission from './entity/groupPermission.entity';
import Permission from './entity/permission.entity';
import User from './entity/user.entity';
import UserGroup from './entity/userGroup.entity';
import UserPermission from './entity/userPermission.entity';
import { EntityResolver } from './resolver/entity.resolver';
import { GroupResolver } from './resolver/group.resolver';
import { PermissionResolver } from './resolver/permission.resolver';
import { UserResolver } from './resolver/user.resolver';
import { EntityService } from './service/entity.service';
import { GroupService } from './service/group.service';
import { PermissionService } from './service/permission.service';
import UserService from './service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forFeature([Permission]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserGroup]),
    TypeOrmModule.forFeature([UserPermission]),
    TypeOrmModule.forFeature([GroupPermission]),
    TypeOrmModule.forFeature([EntityModel]),
    TypeOrmModule.forFeature([EntityPermission]),
    RedisCacheModule
  ],
  providers: [
    GroupResolver,
    GroupService,
    PermissionService,
    EntityService,
    PermissionResolver,
    UserService,
    UserResolver,
    EntityResolver,
    AuthenticationHelper,
    ConfigService,
    RedisCacheService
  ],
})
export class AuthorizationModule {}
