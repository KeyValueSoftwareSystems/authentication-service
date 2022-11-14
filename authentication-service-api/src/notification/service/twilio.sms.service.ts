import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';
import { SMSInterface } from '../interfaces/sms.interface';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export default class TwilioSmsService implements SMSInterface {
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
    @InjectTwilio() private readonly client: TwilioClient,
  ) {}

  async sendSMS(to: string, body: string) {
    try {
      await this.client.messages.create({
        body,
        to,
        from: this.configService.get('TWILIO_SENDING_NUMBER'),
      });
      this.loggerService.info(
        `Successfully send message to the user - ${to} with body - ${body} through twilio`,
      );
    } catch (e) {
      throw new InternalServerErrorException(
        `Error on sending message through twilio - error: ${JSON.stringify(e)}`,
      );
    }
  }
}
