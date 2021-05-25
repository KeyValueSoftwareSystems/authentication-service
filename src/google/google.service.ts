import { Injectable } from '@nestjs/common';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleService {
  constructor(private readonly configService: ConfigService) {}
  async login(googleLoginDto: GoogleLoginDto) {
    const CLIENT_ID = this.configService.get('GOOGLE_CLIENT_ID');
    console.log(CLIENT_ID);
    const { idToken } = googleLoginDto;
    const client: OAuth2Client = new OAuth2Client(CLIENT_ID);
    const ticket: LoginTicket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload: TokenPayload | undefined = ticket.getPayload();

    return {
      service: 'google',
      picture: payload?.picture,
      id: payload?.sub,
      name: payload?.name,
      email: payload?.email,
    };
  }
}
