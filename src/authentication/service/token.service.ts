import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import User from '../../authorization/entity/user.entity';
import UserService from '../../authorization/service/user.service';
import {
  InviteTokenResponse,
  TokenResponse,
} from '../../schema/graphql.schema';
import { AuthenticationHelper } from '../authentication.helper';

@Injectable()
export class TokenService {
  constructor(
    private userService: UserService,
    private authenticationHelper: AuthenticationHelper,
    private configService: ConfigService,
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
    const tokenResponse: TokenResponse = { ...token, user: userRecord };
    return tokenResponse;
  }

  async resetToken(id: string): Promise<void> {
    await this.userService.updateField(id, 'refreshToken', '');
  }

  async refreshInviteToken(id: string): Promise<InviteTokenResponse> {
    const userDetails = await this.userService.getUserById(id);
    const refreshInviteToken = this.authenticationHelper.generateInvitationToken(
      { id: userDetails.id },
      this.configService.get('INVITATION_TOKEN_EXPTIME'),
    );
    await this.userService.updateField(
      userDetails.id,
      'inviteToken',
      refreshInviteToken.token,
    );
    return {
      inviteToken: refreshInviteToken.token,
      tokenExpiryTime: refreshInviteToken.tokenExpiryTime,
    };
  }

  async getNewToken(userRecord: User): Promise<TokenResponse> {
    const token = this.authenticationHelper.generateTokenForUser(userRecord);
    await this.userService.updateField(
      userRecord.id,
      'refreshToken',
      token.refreshToken,
    );
    const tokenResponse: TokenResponse = { ...token, user: userRecord };
    return tokenResponse;
  }

  async revokeInviteToken(id: string): Promise<boolean> {
    await this.userService.updateField(id, 'inviteToken', null);
    return true;
  }
}
