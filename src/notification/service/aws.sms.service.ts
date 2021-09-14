import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMSInterface } from '../interfaces/sms.interface';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export default class AWSSMSService implements SMSInterface {
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {}

  async sendSMS(to: string, body: string) {
    // Implement aws sms service here and change the module loading in notification module to replace sms service.
  }
}
