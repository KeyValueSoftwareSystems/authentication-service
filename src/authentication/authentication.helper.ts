import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import User from '../authorization/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthenticationHelper {
  constructor(private configService: ConfigService) {}

  generateAccessToken(userDetails: User) {
    const expiresIn =
      this.configService.get('JWT_TOKEN_EXPTIME') * 1 || 60 * 60;
    const secret = this.configService.get('JWT_SECRET') as string;
    const username = userDetails.email || userDetails.phone;

    const dataStoredInToken = {
      username: username,
      sub: userDetails.id,
      env: this.configService.get('ENV') || 'local',
    };
    return jwt.sign(dataStoredInToken, secret, { expiresIn });
  }

  generateRefreshToken(userDetails: User) {
    const expiresIn =
      this.configService.get('JWT_REFRESH_TOKEN_EXP_TIME') * 1 || 60 * 60;
    const secret = this.configService.get('JWT_SECRET') as string;

    const dataStoredInToken = {
      sub: userDetails.id,
      env: this.configService.get('ENV') || 'local',
    };
    return jwt.sign(dataStoredInToken, secret, { expiresIn });
  }

  generateTokenForUser(userDetails: User) {
    const accessToken = this.generateAccessToken(userDetails);
    const refreshToken = this.generateRefreshToken(userDetails);
    return { accessToken, refreshToken };
  }

  validateAuthToken(authorization: string) {
    const secret = this.configService.get('JWT_SECRET') || '';
    const reqAuthToken = authorization;
    const verificationResponse: any = jwt.verify(reqAuthToken, secret);
    const env = this.configService.get('ENV') || 'local';
    if (verificationResponse.env !== env) {
      throw new UnauthorizedException();
    }
    const user = { ...verificationResponse, id: verificationResponse.sub };
    return user;
  }

  isPasswordValid(plainTextPassword: string, hashedPassword: string) {
    return bcrypt.compareSync(plainTextPassword, hashedPassword);
  }

  generatePasswordHash(plainTextPassword: string, salt = 10) {
    return bcrypt.hashSync(plainTextPassword, salt);
  }

  generateInvitationToken = (payload: any, time?: string) => {
    return jwt.sign(payload, process.env.JWT_SECRET || '', {
      expiresIn: time ? time : process.env.JWT_TOKEN_EXPTIME,
    });
  };

  validateInvitationToken(inviteToken: string) {
    const secret = this.configService.get('JWT_SECRET') || '';
    const verificationResponse: any = jwt.verify(inviteToken, secret);
    return verificationResponse;
  }
}
