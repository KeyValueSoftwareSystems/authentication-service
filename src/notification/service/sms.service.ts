import { Inject, Injectable } from '@nestjs/common';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class SmsService {
  constructor(
    private configService: ConfigService,
    @InjectTwilio() private readonly client: TwilioClient,
  ) {}

  async sendMessageWithTwilio(to: string, body: string) {
    try {
      return await this.client.messages.create({
        body,
        to,
        from: this.configService.get('TWILIO_SENDING_NUMBER'),
      });
    } catch (e) {
      console.log(e);
    }
  }
}
