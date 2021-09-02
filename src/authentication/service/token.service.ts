import { Injectable, UnauthorizedException } from '@nestjs/common';
import User from '../../authorization/entity/user.entity';
import UserService from '../../authorization/service/user.service';
import { TokenResponse, UserLoginInput, UserSignupInput, UserSignupResponse } from '../../schema/graphql.schema';
import { AuthenticationHelper } from '../authentication.helper';

@Injectable()
export class TokenService {
  constructor(
    private userService: UserService,
    private authenticationHelper: AuthenticationHelper,
  ) {} 

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = this.authenticationHelper.validateAuthToken(refreshToken);
    const userRecord: User | undefined = await this.userService.getUserById(
      response.sub,
    );
    if (userRecord.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }
    const token = this.authenticationHelper.generateTokenForUser(userRecord);
    token.refreshToken = refreshToken;
    return token;
  }

  async resetToken(id: string): Promise<void> {
    await this.userService.updateField(id, 'refreshToken', '');
  }

  async getNewToken(userRecord: User): Promise<TokenResponse> {
    const token: TokenResponse = this.authenticationHelper.generateTokenForUser(
      userRecord,
    );
    await this.userService.updateField(
      userRecord.id,
      'refreshToken',
      token.refreshToken,
    );
    return token;
  }
}