import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || 'DUMMY_CLIENT_ID',
      clientSecret: configService.get('GOOGLE_SECRET'),
      callbackURL: configService.get('APP_URL') + '/auth/api/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, id } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      externalUserId: id,
    };
    done(null, user);
  }
}

export class GoogleLoginUser {
  email!: string;
  firstName!: string;
  middleName?: string;
  lastName!: string;
  externaluserId!: string;
}
