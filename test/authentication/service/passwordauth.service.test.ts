import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import {
  InvalidCredentialsException,
  InvalidPayloadException,
  UserExistsException,
} from '../../../src/authentication/exception/userauth.exception';
import PasswordAuthService from '../../../src/authentication/service/password.auth.service';
import { TokenService } from '../../../src/authentication/service/token.service';
import User from '../../../src/authorization/entity/user.entity';
import UserService from '../../../src/authorization/service/user.service';
import {
  UserPasswordLoginInput,
  UserPasswordSignupInput,
} from '../../../src/schema/graphql.schema';

let users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t',
    firstName: 'Test1',
    lastName: 'Test2',
    origin: 'simple',
  },
];

describe('test PasswordAuthService', () => {
  let passwordAuthService: PasswordAuthService;
  let authenticationHelper: AuthenticationHelper;
  const userService = Substitute.for<UserService>();
  const configService = Substitute.for<ConfigService>();
  const tokenService = Substitute.for<TokenService>();
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
        { provide: 'TokenService', useValue: tokenService },
        PasswordAuthService,
        AuthenticationHelper,
      ],
    }).compile();
    passwordAuthService = moduleRef.get<PasswordAuthService>(
      PasswordAuthService,
    );
    authenticationHelper = moduleRef.get<AuthenticationHelper>(
      AuthenticationHelper,
    );

    const hashedPassword = authenticationHelper.generatePasswordHash('s3cr3t');
    const token = authenticationHelper.generateTokenForUser(users[0]);
    users = [
      {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        email: 'user@test.com',
        phone: '9112345678910',
        password: hashedPassword,
        firstName: 'Test1',
        lastName: 'Test2',
        refreshToken: token.refreshToken,
        origin: 'simple',
      },
    ];
  });

  it('should login a user', async () => {
    const hashedPassword = authenticationHelper.generatePasswordHash('s3cr3t');

    const users: User[] = [
      {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        email: 'user@test.com',
        phone: '9112345678910',
        password: hashedPassword,
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
      },
    ];

    const input: UserPasswordLoginInput = {
      username: 'user@test.com',
      password: 's3cr3t',
    };

    userService
      .getUserDetailsByUsername('user@test.com', 'user@test.com')
      .returns(Promise.resolve(users[0]));
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
    const resp = await passwordAuthService.userLogin(input);
    expect(resp).toHaveProperty('accessToken');
    expect(resp).toHaveProperty('refreshToken');
  });

  it('should not login user since the user password is wrong', async () => {
    const input: UserPasswordLoginInput = {
      username: 'user@test.com',
      password: 's3cr3tWrong',
    };

    const resp = passwordAuthService.userLogin(input);
    expect(resp).rejects.toThrowError(new InvalidCredentialsException());
  });

  it('should signup a user', async () => {
    const hashedPassword = authenticationHelper.generatePasswordHash(
      users[0].password as string,
    );

    const userResponse: User[] = [
      {
        id: users[0].id,
        email: users[0].email,
        phone: users[0].phone,
        password: hashedPassword,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        origin: 'simple',
      },
    ];

    const verifyObj = {
      existingUserDetails: undefined,
      duplicate: 'username',
    };
    const userSingup: UserPasswordSignupInput = {
      ...users[0],
      password: users[0].password as string,
    };
    userService
      .verifyDuplicateUser(users[0].email, users[0].phone)
      .returns(Promise.resolve(verifyObj));
    userService.createUser(Arg.any()).returns(Promise.resolve(userResponse[0]));

    const resp = await passwordAuthService.userSignup(userSingup);

    const receivedResponse = {
      id: resp.id,
      email: resp.email,
      phone: resp.phone,
      password: users[0].password,
      firstName: resp.firstName,
      lastName: resp.lastName,
      origin: 'simple',
    };

    const expectedUser = users[0];
    delete expectedUser['refreshToken'];
    expect(receivedResponse).toEqual(expectedUser);
  });

  it('should throw error when signing up an existing user', async () => {
    const existUsers: User[] = [
      {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        email: 'user2@test.com',
        phone: '91123456789101',
        password: 's3cr3t',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
      },
    ];
    const userSingup: UserPasswordSignupInput = {
      ...existUsers[0],
      password: 's3cr3t',
    };
    const verifyObj = {
      existingUserDetails: existUsers[0],
      duplicate: 'username',
    };

    userService
      .verifyDuplicateUser(existUsers[0].email, existUsers[0].phone)
      .resolves(verifyObj);

    const resp = passwordAuthService.userSignup(userSingup);
    await expect(resp).rejects.toThrowError(
      new UserExistsException(existUsers[0], 'username'),
    );
  });

  it('should update a user password', async () => {
    const input = {
      username: 'user@test.com',
      currentPassword: 's3cr3t',
      newPassword: 'n3ws3cr3t',
    };

    userService
      .updateField(users[0].id, 'password', Arg.any())
      .returns(Promise.resolve(users[0]));

    userService.getUserById(users[0].id).returns(Promise.resolve(users[0]));

    const resp = await passwordAuthService.updatePassword(users[0].id, input);
    expect(resp).toHaveReturned;
  });

  it('should throw invalid password exception', async () => {
    const input = {
      username: 'user@test.com',
      currentPassword: 's3cr3tWrong',
      newPassword: 'n3ws3cr3t',
    };

    const resp = passwordAuthService.updatePassword(users[0].id, input);
    await expect(resp).rejects.toThrowError(
      new InvalidPayloadException('Current password is incorrect'),
    );
  });
});
