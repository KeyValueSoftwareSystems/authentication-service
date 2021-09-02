import { ConfigService } from '@nestjs/config';
import { OTPVerifiable } from '../authentication/interfaces/otp.verifiable';
import { DefaultOTPService } from '../authentication/service/default.otp.service';
import TwilioOTPService from '../authentication/service/twilio.otp.service';
import { OTPVerifyToolEnum, SMSIntegrationEnum } from '../constants/integrations.enum';
import { SMSInterface } from '../notification/interfaces/sms.interface';
import AWSSMSService from '../notification/service/aws.sms.service';
import TwilioSmsService from '../notification/service/twilio.sms.service';

export class ProviderFactory {
  public static getSMSFactory() {
    return {
      provide: SMSInterface,
      useFactory: async (
        configService: ConfigService,
        twilioSmsService: TwilioSmsService,
        awsSMSService: AWSSMSService,
      ) => {
        const smsIntegration = configService.get('SMS_INTEGRATION');
        switch (smsIntegration) {
          case SMSIntegrationEnum.TWILIO:
            return twilioSmsService;
          case SMSIntegrationEnum.AWS:
            // Not yet implemented. If using this, please implement AWSSMSService
            return awsSMSService;
          default:
            return twilioSmsService;
        }
      },
      inject: [ConfigService, TwilioSmsService, AWSSMSService],
    };
  }

  public static getOTPVerifierFactory() {
    return {
      provide: OTPVerifiable,
      useFactory: async (
        configService: ConfigService,
        twilioOtpService: TwilioOTPService,
        otpService: DefaultOTPService,
      ) => {
        const verifyTool = configService.get('OTP_VERIFY_TOOL');
        if (!verifyTool) {
          return otpService;
        }
        switch (verifyTool.toUpperCase()) {
          case OTPVerifyToolEnum.TWILIO:
            return twilioOtpService;
          case OTPVerifyToolEnum.DEFAULT:
            return otpService;
          default:
            return otpService;
        }
      },
      inject: [ConfigService, TwilioOTPService, DefaultOTPService],
    };
  }
}