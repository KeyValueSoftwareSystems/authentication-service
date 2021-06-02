import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import User from '../authorization/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationHelper {
  constructor(private configService: ConfigService) {}

  createToken(userDetails: User) {
    const expiresIn = 60 * 60;
    const secret = this.configService.get('JWT_SECRET') as string;
    const username = userDetails.email || userDetails.phone;

    const dataStoredInToken = {
      username: username,
    };
    return {
      expiresInSeconds: expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  validateAuthToken(request: { headers: { authorization: string } }) {
    const secret = this.configService.get('JWT_SECRET') || '';
    const reqAuthToken = request.headers.authorization.split(' ')[1];
    const verificationResponse: any = jwt.verify(reqAuthToken, secret);
    return verificationResponse;
  }

  isPasswordValid(plainTextPassword: string, hashedPassword: string) {
    return bcrypt.compareSync(plainTextPassword, hashedPassword);
  }

  generatePasswordHash(plainTextPassword: string, salt = 10) {
    return bcrypt.hashSync(plainTextPassword, salt);
  }
}
