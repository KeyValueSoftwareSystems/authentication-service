import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SMSIntegrationEnum } from '../constants/integrations.enum';
import { ProviderFactory } from '../factory/provider.factory';
import { LoggerService } from '../logger/logger.service';
import { TwilioImplModule } from '../twilio/twilio.module';
import { SMSInterface } from './interfaces/sms.interface';
import AWSSMSService from './service/aws.sms.service';
import TwilioSmsService from './service/twilio.sms.service';
 
@Module({
  imports: [
    ConfigModule,
    TwilioImplModule,
  ],
  providers: [
    TwilioSmsService,
    AWSSMSService,
    LoggerService,
    ProviderFactory.getSMSFactory()],
  exports: [],
  controllers: [],
})
export class NotificationModule {}
