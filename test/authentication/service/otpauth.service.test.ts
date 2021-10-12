import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import {
  InvalidCredentialsException,
  UserExistsException,
} from '../../../src/authentication/exception/userauth.exception';
import OTPAuthService from '../../../src/authentication/service/otp.auth.service';
import { TokenService } from '../../../src/authentication/service/token.service';
import TwilioOTPService from '../../../src/authentication/service/twilio.otp.service';
import User from '../../../src/authorization/entity/user.entity';
import UserService from '../../../src/authorization/service/user.service';
import {
  UserOTPLoginInput,
  UserOTPSignupInput,
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

describe('test OTPAuthService', () => {
  let otpAuthService: OTPAuthService;
  let authenticationHelper: AuthenticationHelper;
  const userService = Substitute.for<UserService>();
  const configService = Substitute.for<ConfigService>();
  const otpService = Substitute.for<TwilioOTPService>();
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
        { provide: 'OTPVerifiable', useValue: otpService },
        OTPAuthService,
        AuthenticationHelper,
      ],
    }).compile();
    otpAuthService = moduleRef.get<OTPAuthService>(OTPAuthService);
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
    //const hashedPassword = authenticationHelper.generatePasswordHash('s3cr3t');

    const users: User[] = [
      {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        email: 'user@test.com',
        phone: '9112345678910',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
      },
    ];

    const input: UserOTPLoginInput = {
      username: '9112345678910',
      otp: '123456',
    };

    userService
      .getUserDetailsByUsername('user@test.com', '9112345678910')
      .returns(Promise.resolve(users[0]));
    userService
      .updateField(users[0].id, 'refreshToken', Arg.any())
      .returns(Promise.resolve(users[0]));
    const resp = await otpAuthService.userLogin(input);
    expect(resp).toHaveProperty('accessToken');
    expect(resp).toHaveProperty('refreshToken');
  });

  it('should not login user if otp is not valid', async () => {
    const users: User[] = [
      {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        email: 'user@test.com',
        phone: '9112345678910',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
      },
    ];
    const input: UserOTPLoginInput = {
      username: '9112345678910',
      otp: '999999',
    };
    otpService.validateOTP('999999', Arg.any()).returns(Promise.resolve(false));
    const resp = otpAuthService.userLogin(input);
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
    const userSignup: UserOTPSignupInput = {
      phone: users[0].phone as string,
      firstName: users[0].firstName,
      lastName: users[0].lastName,
    };
    userService
      .verifyDuplicateUser(userSignup.email, userSignup.phone)
      .resolves({
        existingUserDetails: undefined,
        duplicate: 'username',
      });

    userService.createUser(Arg.any()).returns(Promise.resolve(userResponse[0]));

    const resp = await otpAuthService.userSignup(userSignup);

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
        phone: '91123456789101',
        firstName: 'Test1',
        lastName: 'Test2',
        origin: 'simple',
      },
    ];
    const userSignup: UserOTPSignupInput = {
      phone: existUsers[0].phone as string,
      firstName: existUsers[0].firstName,
      lastName: existUsers[0].lastName,
    };

    userService
      .verifyDuplicateUser(existUsers[0].email, existUsers[0].phone)
      .resolves({
        existingUserDetails: existUsers[0],
        duplicate: 'username',
      });

    const resp = otpAuthService.userSignup(userSignup);

    await expect(resp).rejects.toThrowError(
      new UserExistsException(existUsers[0], 'username'),
    );
  });

  it('should generate and send otp', async () => {
    const input = {
      username: 'user@test.com',
      currentPassword: 's3cr3t',
      newPassword: 'n3ws3cr3t',
    };

    userService
      .getActiveUserByPhoneNumber('91234567980')
      .returns(Promise.resolve(users[0]));

    const resp = await otpAuthService.sendOTP('91234567980');
    expect(resp).toHaveReturned;
  });
});
