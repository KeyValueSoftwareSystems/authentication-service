import { Test } from '@nestjs/testing';
import User from '../../../src/authorization/entity/user.entity';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import UserService from '../../../src/authorization/service/user.service';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import UserauthService from '../../../src/authentication/service/userauth.service';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { UserLoginInput, UserSignupInput } from 'src/schema/graphql.schema';
import {
  InvalidCredentialsException,
  InvalidPayloadException,
  UserExistsException,
} from '../../../src/authentication/exception/userauth.exception';

const users: User[] = [
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

describe('test UserauthService', () => {
  let userauthService: UserauthService;
  let authenticationHelper: AuthenticationHelper;
  const userService = Substitute.for<UserService>();
  const configService = Substitute.for<ConfigService>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [],
      providers: [
        { provide: 'UserService', useValue: userService },
        { provide: 'ConfigService', useValue: configService },
        UserauthService,
        AuthenticationHelper,
      ],
    }).compile();
    userauthService = moduleRef.get<UserauthService>(UserauthService);
    authenticationHelper = moduleRef.get<AuthenticationHelper>(
      AuthenticationHelper,
    );
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
        active: true,
        updatedDate: new Date(2020, 1, 1),
        origin: 'simple',
      },
    ];

    const input: UserLoginInput = {
      username: 'user@test.com',
      password: 's3cr3t',
    };

    userService
      .getUserDetailsByUsername('user@test.com', 'user@test.com')
      .returns(Promise.resolve(users[0]));

    configService.get('JWT_SECRET').returns('s3cr3t1234567890');
    configService.get('JWT_TOKEN_EXPTIME').returns(3600);

    const resp = await userauthService.userLogin(input);
    expect(resp).toHaveProperty('expiresInSeconds', 3600);
    expect(resp).toHaveProperty('token');
  });

  it('should not login user since the user password is wrong', async () => {
    const input: UserLoginInput = {
      username: 'user@test.com',
      password: 's3cr3tWrong',
    };

    const resp = userauthService.userLogin(input);
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
        active: users[0].active,
        updatedDate: users[0].updatedDate,
        origin: 'simple',
      },
    ];
    const userSingup: UserSignupInput = {
      ...users[0],
      password: users[0].password as string,
    };
    userService
      .getUserDetailsByEmailOrPhone(users[0].email, users[0].phone)
      .returns(Promise.resolve(undefined));
    userService.createUser(Arg.any()).returns(Promise.resolve(userResponse[0]));

    const resp = await userauthService.userSignup(userSingup);

    const expectedResponse = {
      id: resp.id,
      email: resp.email,
      phone: resp.phone,
      password: users[0].password,
      firstName: resp.firstName,
      lastName: resp.lastName,
      active: resp.active,
      updatedDate: users[0].updatedDate,
      origin: 'simple',
    };

    expect(expectedResponse).toEqual(users[0]);
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
        active: true,
        updatedDate: new Date(),
        origin: 'simple',
      },
    ];
    const userSingup: UserSignupInput = {
      ...existUsers[0],
      password: 's3cr3t',
    };

    userService
      .getUserDetailsByEmailOrPhone(existUsers[0].email, existUsers[0].phone)
      .resolves(existUsers[0]);

    const resp = userauthService.userSignup(userSingup);

    await expect(resp).rejects.toThrowError(
      new UserExistsException(existUsers[0].email || existUsers[0].phone || ''),
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

    userService
      .getUserDetailsByUsername(Arg.any())
      .returns(Promise.resolve(users[0]));

    const resp = await userauthService.updatePassword(input.username, input);
    expect(resp).toHaveReturned;
  });

  it('should throw invalid password exception', async () => {
    const input = {
      username: 'user@test.com',
      currentPassword: 's3cr3tWrong',
      newPassword: 'n3ws3cr3t',
    };

    const resp = userauthService.updatePassword(input.username, input);
    await expect(resp).rejects.toThrowError(
      new InvalidPayloadException('Current password is incorrect'),
    );
  });
});
