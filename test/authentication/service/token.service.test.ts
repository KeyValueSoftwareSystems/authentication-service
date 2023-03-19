import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  InviteTokenResponse,
  Status,
} from '../../../src/schema/graphql.schema';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { TokenService } from '../../../src/authentication/service/token.service';
import User from '../../../src/authorization/entity/user.entity';
import { UserServiceInterface } from '../../../src/authorization/service/user.service.interface';
import { createMock } from '@golevelup/ts-jest';

describe('test TokenService', () => {
  let tokenService: TokenService;
  let authenticationHelper: AuthenticationHelper;
  const userService: UserServiceInterface = createMock<UserServiceInterface>();
  const configService: ConfigService = createMock<ConfigService>();
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [],
      providers: [
        { provide: UserServiceInterface, useValue: userService },
        { provide: ConfigService, useValue: configService },
        TokenService,
        AuthenticationHelper,
      ],
    }).compile();
    tokenService = moduleRef.get<TokenService>(TokenService);
    authenticationHelper = moduleRef.get<AuthenticationHelper>(
      AuthenticationHelper,
    );
  });

  it('should refresh jwt token', async () => {
    const users: User[] = [
      {
        id: 'a2413b29-1b8b-4c83-aaff-3a5a977e0a1a',
        email: 'user@test.com',
        phone: '9112345678910',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];

    jest.mocked(userService).getUserById.mockResolvedValue(users[0]);
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    jest
      .mocked(configService)
      .get.mockReturnValue(3600)
      .mockReturnValue('s3cr3t');

    const token = authenticationHelper.generateTokenForUser(users[0]);
    users[0].refreshToken = token.refreshToken;
    const resp = await tokenService.refresh(users[0].refreshToken as string);

    expect(resp).toHaveProperty('accessToken');
    expect(resp).toHaveProperty('refreshToken');
  });

  it('should refresh invite token', async () => {
    const users: User[] = [
      {
        id: 'ee809c91-a9bf-4589-b9db-7a116dda3158',
        email: 'user@test.com',
        phone: '9112345678910',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    jest.mocked(userService).getUserById.mockResolvedValue(users[0]);
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    jest
      .mocked(configService)
      .get.mockReturnValue('s3cr3t')
      .mockReturnValueOnce('s3cr3t')
      .mockReturnValueOnce('7d');

    const refreshInviteToken = authenticationHelper.generateInvitationToken(
      { id: 'ee809c91-a9bf-4589-b9db-7a116dda3158' },
      '7d',
    );

    users[0].inviteToken = refreshInviteToken.token;
    const inviteTokenRespnse: InviteTokenResponse = {
      inviteToken: refreshInviteToken.token,
      tokenExpiryTime: '7d',
      user: users[0],
    };
    const resp = await tokenService.refreshInviteToken(users[0].id);
    expect(resp).toEqual(inviteTokenRespnse);
  });

  it('Get new jwt token', async () => {
    const users: User[] = [
      {
        id: 'a2413b29-1b8b-4c83-aaff-3a5a977e0a1a',
        email: 'user@test.com',
        phone: '9112345678910',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    jest.mocked(configService).get.mockReturnValue('s3cr3t');
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    const resp = await tokenService.getNewToken(users[0]);

    expect(resp).toHaveProperty('accessToken');
    expect(resp).toHaveProperty('refreshToken');
  });

  it('Reset jwt token', async () => {
    const users: User[] = [
      {
        id: 'a2413b29-1b8b-4c83-aaff-3a5a977e0a1a',
        email: 'user@test.com',
        phone: '9112345678910',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    await tokenService.resetToken(users[0].id);
  });

  it('should revoke invite token', async () => {
    const users: User[] = [
      {
        id: 'ee809c91-a9bf-4589-b9db-7a116dda3158',
        email: 'user@test.com',
        phone: '9112345678910',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    users[0].inviteToken = '';
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    const resp = await tokenService.revokeInviteToken(users[0].id);
    expect(resp).toEqual(true);
  });
});
