import { Module } from '@nestjs/common';
import { GoogleAuthService } from './service/google.service';
import { GoogleAuthController } from './controller/google.controller';
import UserAuthService from './service/user.auth.service';
import UserAuthResolver from './resolver/user.auth.resolver';
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
import { OtpGeneratorService } from './service/otp.generator.service';
import SmsService from '../notification/service/sms.service';
import { TwilioImplModule } from '../notification/twilio/twilio.module';
import { TwilioModule } from 'nestjs-twilio';
import { TwoFAController } from './controller/two.FA.controller';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import UserService from '../authorization/service/user.service';
import GroupCacheService from '../authorization/service/groupcache.service';
import UserCacheService from '../authorization/service/usercache.service';
import PermissionCacheService from '../authorization/service/permissioncache.service';

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
    TwilioModule,
    TwilioImplModule,
    AuthorizationModule,
  ],
  providers: [
    UserAuthResolver,
    UserAuthService,
    UserService,
    GoogleAuthController,
    GoogleAuthService,
    AuthenticationHelper,
    ConfigService,
    GoogleStrategy,
    AuthenticationHelper,
    ConfigService,
    UserCacheService,
    GroupCacheService,
    PermissionCacheService,
    LoggerService,
    OtpGeneratorService,
    SmsService,
    TwoFAController,
  ],
  controllers: [GoogleAuthController, TwoFAController],
})
export class UserAuthModule {}
