import { Module } from '@nestjs/common';
import { GoogleAuthService } from './service/google.service';
import { GoogleAuthController } from './controller/google.controller';
import UserauthService from './service/userauth.service';
import UserauthResolver from './resolver/userauth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/authorization/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationHelper } from './authentication.helper';
import Group from 'src/authorization/entity/group.entity';
import GroupPermission from 'src/authorization/entity/groupPermission.entity';
import Permission from 'src/authorization/entity/permission.entity';
import UserGroup from 'src/authorization/entity/userGroup.entity';
import UserPermission from 'src/authorization/entity/userPermission.entity';
import { GoogleStrategy } from './passport/googleStrategy';
import { RedisCacheModule } from '../cache/redis-cache/redis-cache.module';
import { LoggerService } from 'src/logger/logger.service';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Permission,
      User,
      UserGroup,
      UserPermission,
      GroupPermission,
    ]),
    ConfigModule,
    RedisCacheModule,
    AuthorizationModule,
  ],
  providers: [
    UserauthResolver,
    UserauthService,
    GoogleAuthController,
    GoogleAuthService,
    AuthenticationHelper,
    ConfigService,
    GoogleStrategy,
    AuthenticationHelper,
    ConfigService,
    LoggerService,
  ],
  controllers: [GoogleAuthController],
})
export class UserauthModule {}
