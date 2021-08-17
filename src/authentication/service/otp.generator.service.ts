import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import User from '../../authorization/entity/user.entity';
import { authenticator } from 'otplib';
import * as speakeasy from 'speakeasy';
import { GeneratedSecret } from 'speakeasy';

@Injectable()
export class OtpGeneratorService {
  private authenticator = authenticator;
  constructor(private configService: ConfigService) {
    this.authenticator.options = {
      step: Number(configService.get('OTP_STEP')),
      window: Number(configService.get('OTP_WINDOW')),
    };
  }

  generateOTP(keyString: string) {
    const secret = (keyString + this.configService.get('OTP_SECRET')) as string;
    return this.authenticator.generate(secret);
  }

  validate2FAOTP(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  validateOTP(token: string, keyString: string | undefined) {
    const secret = (keyString + this.configService.get('OTP_SECRET')) as string;
    return this.authenticator.verify({ token, secret });
  }

  public async generateTotpSecret(user: User) {
    const twoFASecret = speakeasy.generateSecret({ length: 20 });
    const otpUri = this.authenticator.keyuri(
      user.id,
      <string>this.configService.get('2FA_APP_NAME'),
      twoFASecret.base32,
    );
    return {
      secret: twoFASecret,
      otpUri,
    };
  }

  public verify2FACode(code: string, user: User) {
    if (user.twoFASecret) {
      const secret = JSON.parse(user.twoFASecret) as GeneratedSecret;
      return this.validate2FAOTP(code, secret.base32);
    }
  }
}
