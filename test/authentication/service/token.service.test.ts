import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { TokenService } from '../../../src/authentication/service/token.service';
import User from '../../../src/authorization/entity/user.entity';
import UserService from '../../../src/authorization/service/user.service';

let users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
    updatedDate: new Date(),
    origin: 'simple',
  },
];

describe('test TokenService', () => {
  let tokenService: TokenService;
  let authenticationHelper: AuthenticationHelper;
  const userService = Substitute.for<UserService>();
  const configService = Substitute.for<ConfigService>();
  configService.get('ENV').returns('local');
  configService.get('JWT_SECRET').returns('s3cr3t1234567890');
  configService.get('JWT_TOKEN_EXPTIME').returns(3600);
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
        active: true,
        updatedDate: new Date(),
        origin: 'simple',
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

  it('Get new jwt token', async () => {
    const users: User[] = [
      {
        id: 'a2413b29-1b8b-4c83-aaff-3a5a977e0a1a',
        email: 'user@test.com',
        phone: '9112345678910',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        active: true,
        updatedDate: new Date(),
        origin: 'simple',
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
        active: true,
        updatedDate: new Date(),
        origin: 'simple',
      },
    ];
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
    await tokenService.resetToken(users[0].id);
  });

  
});
