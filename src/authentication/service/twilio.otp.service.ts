import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import User from '../../authorization/entity/user.entity';
import { LoggerService } from '../../logger/logger.service';
import { OTPVerifiable } from '../interfaces/otp.verifiable';

@Injectable()
export default class TwilioOTPService implements OTPVerifiable {
  constructor(
    private configService: ConfigService,
    @InjectTwilio() private readonly client: TwilioClient,
    private logger: LoggerService,
  ) {}
  async validateOTP(otp: string, user: User): Promise<boolean> {
    const result = await this.client.verify
      .services(this.configService.get('TWILIO_VERIFY_SID') as string)
      .verificationChecks.create({ to: user.phone as string, code: otp });
    this.logger.debug(
      `Validation response from the user - ${user.firstName} with id ${
        user.id
      }. validation response ${JSON.stringify(result)}`,
    );
    if (result.status == 'approved') {
      return true;
    } else {
      return false;
    }
  }
  async sendOTP(user: User): Promise<void> {
    try {
      const result = await this.client.verify
        .services(this.configService.get('TWILIO_VERIFY_SID') as string)
        .verifications.create({ to: user.phone as string, channel: 'sms' });
      this.logger.info(
        `Succesfully sent otp to the user - ${user.firstName} with id ${user.id}. OTP sent status is ${result.status}`,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Integration with twilio failed with error - ${JSON.stringify(err)}`,
      );
    }
  }
}
