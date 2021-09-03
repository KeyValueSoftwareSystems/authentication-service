import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioImplModule } from '../twilio/twilio.module';

@Module({
  imports: [ConfigModule, TwilioImplModule],
  providers: [],
  exports: [],
  controllers: [],
})
export class NotificationModule {}
