import {
  Injectable,
  InternalServerErrorException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OTPVerifiable } from '../interfaces/otp.verifiable';
import User from '../../authorization/entity/user.entity';
import { authenticator } from 'otplib';
import { SMSInterface } from '../../notification/interfaces/sms.interface';

@Injectable()
export class DefaultOTPService implements OTPVerifiable {
  private authenticator = authenticator;
  constructor(
    private readonly smsService: SMSInterface,
    private readonly configService: ConfigService,
  ) {
    this.authenticator.options = {
      step: Number(configService.get('OTP_STEP')),
      window: Number(configService.get('OTP_WINDOW')),
    };
  }
  async sendOTP(user: User): Promise<void> {
    const secretKeyConstant = this.configService.get('OTP_SECRET');
    if (!secretKeyConstant) {
      throw new InternalServerErrorException(
        'Secret key is not configured for otp generation',
      );
    }
    if (!user.phone) {
      throw new PreconditionFailedException('User Phone number is not present');
    }
    const secret = (user.id + secretKeyConstant) as string;
    const otp = this.authenticator.generate(secret);
    await this.smsService.sendSMS(user.phone, otp);
  }
  async validateOTP(otp: string, user: User): Promise<boolean> {
    const secretKeyConstant = this.configService.get('OTP_SECRET');
    if (!secretKeyConstant) {
      throw new InternalServerErrorException(
        'Secret key is not configured for otp generation',
      );
    }
    const secret = (user.id + secretKeyConstant) as string;
    return this.authenticator.verify({ token: otp, secret });
  }
}
