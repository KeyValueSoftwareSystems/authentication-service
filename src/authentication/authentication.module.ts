import { HttpModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import GroupRole from 'src/authorization/entity/groupRole.entity';
import Role from 'src/authorization/entity/role.entity';
import RolePermission from 'src/authorization/entity/rolePermission.entity';
import { AuthorizationModule } from '../authorization/authorization.module';
import Group from '../authorization/entity/group.entity';
import GroupPermission from '../authorization/entity/groupPermission.entity';
import Permission from '../authorization/entity/permission.entity';
import User from '../authorization/entity/user.entity';
import UserGroup from '../authorization/entity/userGroup.entity';
import UserPermission from '../authorization/entity/userPermission.entity';
import { RedisCacheModule } from '../cache/redis-cache/redis-cache.module';
import { ProviderFactory } from '../factory/provider.factory';
import { LoggerService } from '../logger/logger.service';
import { NotificationModule } from '../notification/notification.module';
import AWSSMSService from '../notification/service/aws.sms.service';
import {
  default as SmsService,
  default as TwilioSmsService,
} from '../notification/service/twilio.sms.service';
import { TwilioImplModule } from '../twilio/twilio.module';
import { AuthenticationHelper } from './authentication.helper';
import { GoogleAuthController } from './controller/google.controller';
import { GoogleStrategy } from './passport/googleStrategy';
import UserAuthResolver from './resolver/user.auth.resolver';
import { DefaultOTPService } from './service/default.otp.service';
import { GoogleAuthService } from './service/google.service';
import OTPAuthService from './service/otp.auth.service';
import { TwoFactorAuthService } from './service/otp.generator.service';
import PasswordAuthService from './service/password.auth.service';
import { RecaptchaService } from './service/recaptcha.service';
import { TokenService } from './service/token.service';
import TwilioOTPService from './service/twilio.otp.service';

const providers: Provider[] = [
  UserAuthResolver,
  GoogleAuthService,
  AuthenticationHelper,
  ConfigService,
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
  RecaptchaService,
  GoogleStrategy,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Permission,
      User,
      UserGroup,
      UserPermission,
      GroupPermission,
      Role,
      GroupRole,
      RolePermission,
    ]),
    ConfigModule,
    RedisCacheModule,
    NotificationModule,
    AuthorizationModule,
    TwilioImplModule,
    HttpModule,
  ],
  providers,
  controllers: [GoogleAuthController],
})
export class UserAuthModule {}
