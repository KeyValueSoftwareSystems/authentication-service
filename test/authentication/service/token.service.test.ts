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
import UserService from '../../../src/authorization/service/user.service';

describe('test TokenService', () => {
  let tokenService: TokenService;
  let authenticationHelper: AuthenticationHelper;
  const userService = Substitute.for<UserService>();
  const configService = Substitute.for<ConfigService>();
  configService.get('ENV').returns('local');
  configService.get('JWT_SECRET').returns('s3cr3t1234567890');
  configService.get('JWT_TOKEN_EXPTIME').returns(3600);
  configService.get('INVITATION_TOKEN_EXPTIME').returns('7d');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [],
      providers: [
        { provide: 'UserService', useValue: userService },
        { provide: 'ConfigService', useValue: configService },
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
    const token = authenticationHelper.generateTokenForUser(users[0]);
    users[0].refreshToken = token.refreshToken;
    userService.getUserById(users[0].id).returns(Promise.resolve(users[0]));
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
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
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    const refreshInviteToken = authenticationHelper.generateInvitationToken(
      { id: 'ee809c91-a9bf-4589-b9db-7a116dda3158' },
      '7d',
    );
    userService.getUserById(users[0].id).returns(Promise.resolve(users[0]));

    users[0].inviteToken = refreshInviteToken.token;
    const inviteTokenRespnse: InviteTokenResponse = {
      inviteToken: refreshInviteToken.token,
      tokenExpiryTime: '7d',
      user: users[0],
    };
    userService
      .updateField(users[0].id, 'inviteToken', Arg.any())
      .returns(Promise.resolve(users[0]));
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
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
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
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
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
    userService
      .updateField(users[0].id, 'inviteToken', Arg.any())
      .returns(Promise.resolve(users[0]));
    const resp = await tokenService.revokeInviteToken(users[0].id);
    expect(resp).toEqual(true);
  });
});
