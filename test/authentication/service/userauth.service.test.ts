import { Test } from '@nestjs/testing';
import User from '../../../src/authorization/entity/user.entity';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import UserService from '../../../src/authorization/service/user.service';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import UserauthService from '../../../src/authentication/service/userauth.service';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { UserLoginInput } from 'src/schema/graphql.schema';

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

    const resp = await userauthService.userLogin(input);
    expect(resp).toHaveProperty('expiresInSeconds', 3600);
    expect(resp).toHaveProperty('token');
  });

  it('should signup a user', async () => {
    const hashedPassword = authenticationHelper.generatePasswordHash(
      users[0].password,
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
      },
    ];

    userService
      .getUserDetailsByEmailOrPhone(users[0].email, users[0].phone)
      .returns(Promise.resolve(undefined));
    userService.createUser(Arg.any()).returns(Promise.resolve(userResponse[0]));

    const resp = await userauthService.userSignup(users[0]);

    const expectedResponse = {
      id: resp.id,
      email: resp.email,
      phone: resp.phone,
      password: users[0].password,
      firstName: resp.firstName,
      lastName: resp.lastName,
      active: resp.active,
      updatedDate: users[0].updatedDate,
    };

    expect(expectedResponse).toEqual(users[0]);
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
      .getUserDetailsByUsername('user@test.com')
      .returns(Promise.resolve(users[0]));

    const resp = await userauthService.updatePassword(input.username, input);
    expect(resp).toHaveReturned;
  });
});
