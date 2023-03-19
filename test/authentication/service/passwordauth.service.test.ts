import { createMock } from '@golevelup/ts-jest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  InvalidCredentialsException,
  InvalidPayloadException,
  UserExistsException,
} from '../../../src/authentication/exception/userauth.exception';
import { DataSource } from 'typeorm';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import PasswordAuthService from '../../../src/authentication/service/password.auth.service';
import { TokenService } from '../../../src/authentication/service/token.service';
import User from '../../../src/authorization/entity/user.entity';
import { UserServiceInterface } from '../../../src/authorization/service/user.service.interface';
import {
  Status,
  TokenResponse,
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
    status: Status.ACTIVE,
  },
];

describe('test PasswordAuthService', () => {
  let passwordAuthService: PasswordAuthService;
  let authenticationHelper: AuthenticationHelper;
  const userService: UserServiceInterface = createMock<UserServiceInterface>();
  const configService: ConfigService = createMock<ConfigService>();
  const tokenService: TokenService = createMock<TokenService>();

  const mockDataSource = {
    createEntityManager: jest.fn(),
    transaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [],
      providers: [
        { provide: UserServiceInterface, useValue: userService },
        { provide: ConfigService, useValue: configService },
        { provide: TokenService, useValue: tokenService },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
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
    jest
      .mocked(configService)
      .get.mockReturnValue(3600)
      .mockReturnValue('s3cr3t');

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
        status: Status.ACTIVE,
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
        status: Status.ACTIVE,
      },
    ];
    const input: UserPasswordLoginInput = {
      username: 'user@test.com',
      password: 's3cr3t',
    };
    const token = authenticationHelper.generateTokenForUser(users[0]);
    const tokenResponse: TokenResponse = {
      refreshToken: token.refreshToken,
      accessToken: token.accessToken,
      user: users[0],
    };
    jest
      .mocked(userService)
      .getUserDetailsByUsername.mockResolvedValue(users[0]);
    jest.mocked(userService).updateField.mockResolvedValue(users[0]);
    jest.mocked(tokenService).getNewToken.mockResolvedValue(tokenResponse);
    const resp = await passwordAuthService.userLogin(input);
    expect(resp).toHaveProperty('accessToken');
    expect(resp).toHaveProperty('refreshToken');
    expect(resp.user).toEqual(users[0]);
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
      's3cr3t' as string,
    );
    const userResponse: User[] = [
      {
        id: 'f1bc54fe-9231-472b-8d3c-595c5cb464a7',
        email: 'test@gmail.com',
        phone: '9947849200',
        password: hashedPassword,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        origin: 'simple',
        status: Status.ACTIVE,
      },
    ];
    const verifyObj = {
      existingUserDetails: undefined,
      duplicate: 'email',
    };
    const userSingup: UserPasswordSignupInput = {
      email: 'test@gmail.com',
      phone: '9947849200',
      firstName: users[0].firstName,
      lastName: users[0].lastName,
      middleName: users[0].middleName,
      password: 's3cr3t' as string,
    };
    jest.mocked(userService).verifyDuplicateUser.mockResolvedValue(verifyObj);
    jest.mocked(userService).createUser.mockResolvedValue(userResponse[0]);
    const resp = await passwordAuthService.userSignup(userSingup);

    const receivedResponse = {
      id: resp.id,
      email: resp.email,
      phone: resp.phone,
      password: users[0].password,
      firstName: resp.firstName,
      lastName: resp.lastName,
      origin: 'simple',
      status: Status.ACTIVE,
    };

    const expectedUser = {
      id: 'f1bc54fe-9231-472b-8d3c-595c5cb464a7',
      email: 'test@gmail.com',
      phone: '9947849200',
      password: users[0].password,
      firstName: users[0].firstName,
      lastName: users[0].lastName,
      origin: 'simple',
      status: Status.ACTIVE,
    };
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
        status: Status.ACTIVE,
      },
    ];
    const userSingup: UserPasswordSignupInput = {
      ...existUsers[0],
      password: 's3cr3t',
    };
    const verifyObj = {
      existingUserDetails: existUsers[0],
      duplicate: 'email',
    };

    jest.mocked(userService).verifyDuplicateUser.mockResolvedValue(verifyObj);

    const resp = passwordAuthService.userSignup(userSingup);
    await expect(resp).rejects.toThrowError(
      new UserExistsException(existUsers[0], 'email'),
    );
  });

  it('should update a user password', async () => {
    const input = {
      username: 'user@test.com',
      currentPassword: 's3cr3t',
      newPassword: 'n3ws3cr3t',
    };

    jest.mocked(userService).updateField.mockResolvedValue(users[0]);

    jest.mocked(userService).getUserById.mockResolvedValue(users[0]);

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

  // FIX : transaction have not been mocked

  // it('should signup without password using invite ', async () => {
  //   const verifyObj = {
  //     existingUserDetails: undefined,
  //     duplicate: 'email',
  //   };
  //   const userSignupInput: UserInviteTokenSignupInput = {
  //     email: 'test2@gmail.com',
  //     phone: '9946765432',
  //     firstName: users[0].firstName,
  //     lastName: users[0].lastName,
  //   };
  //   const invitationToken = authenticationHelper.generateInvitationToken(
  //     { id: '471a383c-f656-499d-8ae0-157fb5fc7323' },
  //     '7d',
  //   );
  //   const savedUser = {
  //     id: '471a383c-f656-499d-8ae0-157fb5fc7323',
  //     email: 'test2@gmail.com',
  //     phone: '9946765432',
  //     firstName: users[0].firstName,
  //     lastName: users[0].lastName,
  //     status: Status.INVITED,
  //     origin: 'simple',
  //   };
  //   const expectedResponse: InviteTokenResponse = {
  //     inviteToken: invitationToken.token,
  //     tokenExpiryTime: '7d',
  //     user: {
  //       id: '471a383c-f656-499d-8ae0-157fb5fc7323',
  //       firstName: users[0].firstName,
  //       lastName: users[0].lastName,
  //       inviteToken: invitationToken.token,
  //       status: Status.INVITED,
  //     },
  //   };
  //   userService
  //     .verifyDuplicateUser(userSignupInput.email, userSignupInput.phone)
  //     .returns(Promise.resolve(verifyObj));
  //   connectionMock.transaction(Arg.any()).resolves(expectedResponse);
  //   const resp = await passwordAuthService.inviteTokenSignup(userSignupInput);
  //   expect(resp).toEqual(expectedResponse);
  // });
});
