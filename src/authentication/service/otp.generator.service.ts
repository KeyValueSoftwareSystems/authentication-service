import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import User from '../../authorization/entity/user.entity';
import { authenticator } from 'otplib';
import UserService from '../../authorization/service/user.service';

@Injectable()
export class OtpGeneratorService {
  private authenticator = authenticator;
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.authenticator.options = {
      step: Number(configService.get('OTP_STEP')),
      window: Number(configService.get('OTP_WINDOW')),
    };
  }

  generateOTP(secret: string) {
    return authenticator.generate(secret);
  }

  generateSecret() {
    return authenticator.generateSecret();
  }

  validate(input: string, secret: string) {
    return authenticator.check(input, secret);
  }

  public async generateTotpSecret(user: User) {
    const twoFASecret = this.authenticator.generateSecret();
    const otpUri = authenticator.keyuri(
      user.id,
      <string>this.configService.get('2FA_APP_NAME'),
      twoFASecret,
    );
    await this.userService.setOtpSecret(user, twoFASecret);
    return {
      secret: twoFASecret,
      otpUri,
    };
  }

  public verify2FACode(code: string, user: User) {
    if (user.twoFASecret) {
      return this.validate(code, user.twoFASecret);
    }
  }
}
