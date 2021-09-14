import {
  BadRequestException,
  HttpService,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class RecaptchaService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private logger: LoggerService,
  ) {}

  async verifyGoogleRecaptchaV3(captcha: string) {
    const recaptchaSecretKey = this.configService.get('RECAPTCHA_SECRET_KEY');
    const minRecaptchaScore = this.configService.get('MIN_RECAPTCHA_SCORE');
    const recaptchaVerifyURL = this.configService.get('RECAPTCHA_VERIFY_URL');
    if (!captcha) {
      throw new UnauthorizedException();
    }
    const verificationUrl = `${recaptchaVerifyURL}?secret=${recaptchaSecretKey}&response=${captcha}`;
    const response = await this.httpService.get(verificationUrl).toPromise();
    const body = response.data;
    if (!body.score) {
      throw new BadRequestException(
        'Score missing from response, Ensure the request is going to a V3 app',
      );
    }
    if (body.success && body.score > minRecaptchaScore) {
      return true;
    }
    return false;
  }

  async verifyGoogleRecaptchaV2(captcha: string, ipAddress: string) {
    const recaptchaSecretKey = this.configService.get('RECAPTCHA_SECRET_KEY');
    const recaptchaVerifyURL = this.configService.get('RECAPTCHA_VERIFY_URL');
    if (!captcha) {
      throw new UnauthorizedException();
    }
    const verificationUrl = `${recaptchaVerifyURL}?secret=${recaptchaSecretKey}&response=${captcha}&remoteip=${ipAddress}`;

    const response = await this.httpService.get(verificationUrl).toPromise();
    const body = response.data;
    if (body.success !== undefined && !body.success) {
      throw new UnauthorizedException();
    }
    return body;
  }
}
