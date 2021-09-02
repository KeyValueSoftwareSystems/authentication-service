import { Module } from '@nestjs/common';
import { GoogleAuthService } from './service/google.service';
import { GoogleAuthController } from './controller/google.controller';
import UserAuthResolver from './resolver/user.auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../authorization/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationHelper } from './authentication.helper';
import Group from '../authorization/entity/group.entity';
import GroupPermission from '../authorization/entity/groupPermission.entity';
import Permission from '../authorization/entity/permission.entity';
import UserGroup from '../authorization/entity/userGroup.entity';
import UserPermission from '../authorization/entity/userPermission.entity';
import { GoogleStrategy } from './passport/googleStrategy';
import { RedisCacheModule } from '../cache/redis-cache/redis-cache.module';
import { LoggerService } from '../logger/logger.service';
import { TwoFactorAuthService } from './service/otp.generator.service';
import SmsService from '../notification/service/twilio.sms.service';
import { TwilioImplModule } from '../twilio/twilio.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import UserService from '../authorization/service/user.service';
import GroupCacheService from '../authorization/service/groupcache.service';
import UserCacheService from '../authorization/service/usercache.service';
import PermissionCacheService from '../authorization/service/permissioncache.service';
import PasswordAuthService from './service/password.auth.service';
import { NotificationModule } from '../notification/notification.module';
import OTPAuthService from './service/otp.auth.service';
import TwilioOTPService from './service/twilio.otp.service';
import { OTPVerifiable } from './interfaces/otp.verifiable';
import { TokenService } from './service/token.service';
import {
  OTPVerifyToolEnum,
  SMSIntegrationEnum,
} from '../constants/integrations.enum';
import { DefaultOTPService } from './service/default.otp.service';
import { SMSInterface } from '../notification/interfaces/sms.interface';
import TwilioSmsService from '../notification/service/twilio.sms.service';
import AWSSMSService from '../notification/service/aws.sms.service';
import { ProviderFactory } from '../factory/provider.factory';

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
    NotificationModule,
    AuthorizationModule,
    TwilioImplModule,
  ],
  providers: [
    UserAuthResolver,
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
    TwoFactorAuthService,
    SmsService,
    PasswordAuthService,
    OTPAuthService,
    TwilioOTPService,
    DefaultOTPService,
    TokenService,
    ProviderFactory.getOTPVerifierFactory(),
    ProviderFactory.getSMSFactory(),
    TwilioSmsService,
    AWSSMSService,
    LoggerService,
  ],
  controllers: [GoogleAuthController],
})
export class UserAuthModule {}
