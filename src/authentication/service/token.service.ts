import { Injectable, UnauthorizedException } from '@nestjs/common';
import User from '../../authorization/entity/user.entity';
import UserService from '../../authorization/service/user.service';
import { InviteTokenResponse, TokenResponse } from '../../schema/graphql.schema';
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
    const tokenResponse: TokenResponse = { ...token, user: userRecord };
    return tokenResponse;
  }

  async resetToken(id: string): Promise<void> {
    await this.userService.updateField(id, 'refreshToken', '');
  }

  async refreshInviteToken(id: string): Promise<InviteTokenResponse> {
    const userDetails = await this.userService.getUserById(id);
    const token = this.authenticationHelper.generateInvitationToken(
      { id: userDetails.id },
      '7d',
    );
    await this.userService.updateField(userDetails.id, 'inviteToken', token);
    return { inviteToken: token };
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

  async revokeToken( id: string ): Promise<string> {
    await this.userService.updateField(id, 'inviteToken', null);
    return 'Success';
  }
}
