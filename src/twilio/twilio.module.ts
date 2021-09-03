import { Module } from '@nestjs/common';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => {
        if (cfg.get('IS_TWILIO_INTEGRATED') !== 'true') {
          // Dummy value passing to account initialization to avoid failing the service
          return {
            accountSid: 'ACDUMMYVALUE',
            authToken: 'DUMMYVALUE',
            options: {
              accountSid: 'ACDUMMYVALUE',
            },
          };
        }
        return {
          accountSid: cfg.get('TWILIO_ACC_SID'),
          authToken: cfg.get('TWILIO_AUTH_TOKEN'),
          options: {
            accountSid: cfg.get('TWILIO_ACC_SID'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TwilioImplModule {}
