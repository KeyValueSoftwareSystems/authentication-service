import { Module } from '@nestjs/common';
import UserauthService from './service/userauth.service';
import UserauthResolver from './resolver/userauth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserService from 'src/authorization/service/user.service';
import User from 'src/authorization/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationHelper } from './authentication.helper';
import Group from 'src/authorization/entity/group.entity';
import GroupPermission from 'src/authorization/entity/groupPermission.entity';
import Permission from 'src/authorization/entity/permission.entity';
import UserGroup from 'src/authorization/entity/userGroup.entity';
import UserPermission from 'src/authorization/entity/userPermission.entity';
import UserCacheService from 'src/authorization/service/usercache.service';
import { RedisCacheService } from 'src/cache/redis-cache/redis-cache.service';
import { RedisCacheModule } from 'src/cache/redis-cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forFeature([Permission]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserGroup]),
    TypeOrmModule.forFeature([UserPermission]),
    TypeOrmModule.forFeature([GroupPermission]),
    ConfigModule,
    RedisCacheModule,
  ],
  providers: [
    UserauthResolver,
    UserauthService,
    UserService,
    AuthenticationHelper,
    ConfigService,
    RedisCacheService,
    UserCacheService,
  ],
})
export class UserauthModule {}
