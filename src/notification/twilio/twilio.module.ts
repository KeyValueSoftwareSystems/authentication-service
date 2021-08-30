import { Module } from '@nestjs/common';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import SmsService from '../service/sms.service';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        accountSid: cfg.get('TWILIO_ACC_SID'),
        authToken: cfg.get('TWILIO_AUTH_TOKEN'),
        options: {
          accountSid: cfg.get('TWILIO_ACC_SID'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TwilioImplModule {}
