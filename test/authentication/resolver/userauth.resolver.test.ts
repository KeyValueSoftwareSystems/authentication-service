import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../../src/authorization/service/user.service';
import Substitute, { Arg } from '@fluffy-spoon/substitute';
import User from '../../../src/authorization/entity/user.entity';
import { UserResolver } from '../../../src/authorization/resolver/user.resolver';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import {
  InviteTokenResponse,
  Status,
  TokenResponse,
  UserInviteTokenSignupInput,
  UserPasswordForInviteInput,
  UserPasswordLoginInput,
  UserPasswordSignupInput,
  UserSignupResponse,
} from '../../../src/schema/graphql.schema';
import UserAuthResolver from '../../../src/authentication/resolver/user.auth.resolver';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { ConfigService } from '@nestjs/config';
import UserCacheService from '../../../src/authorization/service/usercache.service';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';
import PasswordAuthService from '../../../src/authentication/service/password.auth.service';
import OTPAuthService from '../../../src/authentication/service/otp.auth.service';
import { TokenService } from '../../../src/authentication/service/token.service';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t1234567890',
    firstName: 'Test',
    lastName: 'User',
    origin: 'simple',
    status: Status.ACTIVE,
  },
];

const gql = '/graphql';

const userService = Substitute.for<UserService>();
const passwordAuthService = Substitute.for<PasswordAuthService>();
const otpAuthService = Substitute.for<OTPAuthService>();
const tokenService = Substitute.for<TokenService>();
const userCacheService = Substitute.for<UserCacheService>();
const redisCacheService = Substitute.for<RedisCacheService>();

describe('Userauth Module', () => {
  let app: INestApplication;
  let authenticationHelper: AuthenticationHelper;
  const configService = Substitute.for<ConfigService>();
  configService.get('ENV').returns('local');
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        UserResolver,
        UserAuthResolver,
        ConfigService,
        AuthenticationHelper,
        { provide: 'UserService', useValue: userService },
        { provide: 'TokenService', useValue: tokenService },
        { provide: 'PasswordAuthService', useValue: passwordAuthService },
        { provide: 'OTPAuthService', useValue: otpAuthService },
        { provide: 'ConfigService', useValue: configService },
        { provide: 'UserCacheService', useValue: userCacheService },
        { provide: 'RedisCacheService', useValue: redisCacheService },
      ],
    }).compile();
    authenticationHelper = moduleFixture.get<AuthenticationHelper>(
      AuthenticationHelper,
    );
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/graphql', () => {
    describe('userauth', () => {
      it('should login a user via password', () => {
        const input: UserPasswordLoginInput = {
          username: 'user@test.com',
          password: 's3cr3t1234567890',
        };
        const user = {
          id: users[0].id,
          email: users[0].email,
          phone: users[0].phone,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
          status: users[0].status,
        };
        const tokenResponse = {
          accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
          eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zI
          iwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMT
          V9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo`,
          refreshToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
          eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zI
          iwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMT
          V9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo`,
          user: user,
        };
        const obj = Object.create(null);
        passwordAuthService
          .userLogin(Object.assign(obj, input))
          .returns(Promise.resolve(tokenResponse));
        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { passwordLogin(input: { username: "user@test.com" password: "s3cr3t1234567890" }) { accessToken, refreshToken, user{ id, email, phone, firstName, lastName, status } }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.passwordLogin).toHaveProperty('accessToken');
            expect(res.body.data.passwordLogin).toHaveProperty('refreshToken');
            expect(res.body.data.passwordLogin.user).toEqual(user);
          });
      });
    });

    it('should signup a user by password', () => {
      const userInput: UserPasswordSignupInput[] = [
        {
          email: users[0].email,
          phone: users[0].phone,
          password: users[0].password as string,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
        },
      ];

      const usersResponse: UserSignupResponse[] = [
        {
          id: users[0].id,
          email: users[0].email,
          phone: users[0].phone,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
        },
      ];

      const obj = Object.create(null);
      passwordAuthService
        .userSignup(Object.assign(obj, userInput[0]))
        .returns(Promise.resolve(usersResponse[0]));
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `mutation { passwordSignup(input: { email: "user@test.com" 
          phone: "9112345678910" password: "s3cr3t1234567890" 
          firstName: "Test" lastName: "User" }) { id email phone firstName lastName }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.passwordSignup).toEqual(usersResponse[0]);
        });
    });

    it('should signup a user without password for invite', () => {
      const userInput: UserInviteTokenSignupInput[] = [
        {
          email: 'test@gmail.com',
          phone: '9947849200',
          firstName: 'Test',
          lastName: 'Name',
        },
      ];

      const usersResponse: InviteTokenResponse = {
        inviteToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo',
        tokenExpiryTime: '7d',
        user: {
          id: 'ebe8a78e-099d-4db8-b2d0-e0b558ac5acb',
          firstName: 'Test',
          lastName: 'Name',
          inviteToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo',
          status: Status.INVITED,
        },
      };
      configService.get('JWT_SECRET').returns('s3cr3t1234567890');

      const token = authenticationHelper.generateAccessToken(users[0]);

      const obj = Object.create(null);
      passwordAuthService
        .inviteTokenSignup(Object.assign(obj, userInput[0]))
        .returns(Promise.resolve(usersResponse));
      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation { inviteTokenSignup(input: { email: "test@gmail.com"
          phone: "9947849200" firstName: "Test" lastName: "Name" }) { inviteToken tokenExpiryTime user{id firstName lastName inviteToken status}}}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.inviteTokenSignup).toEqual(usersResponse);
        });
    });

    it('should signup a user with password after invite', () => {
      const userInput: UserPasswordForInviteInput[] = [
        {
          inviteToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo',
          password: users[0].password as string,
        },
      ];

      const usersResponse: UserSignupResponse[] = [
        {
          id: users[0].id,
          email: users[0].email,
          phone: users[0].phone,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
        },
      ];

      const obj = Object.create(null);
      passwordAuthService
        .setPasswordForInvitedUser(Object.assign(obj, userInput[0]))
        .returns(Promise.resolve(usersResponse[0]));
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `mutation { setPasswordForInvite( input: { inviteToken:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo" password: "s3cr3t1234567890"  }){ id email phone firstName lastName}}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.setPasswordForInvite).toEqual(usersResponse[0]);
        });
    });

    it('should update the password', () => {
      const usersResponse: UserSignupResponse[] = [
        {
          id: users[0].id,
          email: users[0].email,
          phone: users[0].phone,
          firstName: users[0].firstName,
          lastName: users[0].lastName,
        },
      ];

      const token = authenticationHelper.generateAccessToken(users[0]);

      passwordAuthService
        .updatePassword(Arg.any(), Arg.any())
        .returns(Promise.resolve(users[0]));
      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation { changePassword(input: { currentPassword: "s3cr3t1234567890" 
          newPassword: "1234567890s3cr3t" }) { id email phone firstName lastName }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.changePassword).toEqual(usersResponse[0]);
        });
    });

    it('should refresh the invite token', () => {
      const token = authenticationHelper.generateAccessToken(users[0]);
      const inviteTokenResponse: InviteTokenResponse = {
        inviteToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo',
        tokenExpiryTime: '7d',
        user: {
          id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
          firstName: 'Test',
          lastName: 'User',
          inviteToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zIiwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMTV9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo',
          status: Status.INVITED,
        },
      };
      tokenService
        .refreshInviteToken('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
        .returns(Promise.resolve(inviteTokenResponse));

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation {
            refreshInviteToken(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {
              inviteToken
              tokenExpiryTime
              user {
                id
                firstName
                lastName
                inviteToken
                status
              }
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.refreshInviteToken).toEqual(inviteTokenResponse);
        });
    });

    it('should revoke the invite token', () => {
      const token = authenticationHelper.generateAccessToken(users[0]);
      tokenService
        .revokeInviteToken('20ee5419-8597-4ee7-a497-b5a13daa37c8')
        .returns(Promise.resolve(true));

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation { revokeInviteToken(id: "20ee5419-8597-4ee7-a497-b5a13daa37c8")}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.revokeInviteToken).toEqual(true);
        });
    });

    it('should refresh the token', () => {
      const token = authenticationHelper.generateTokenForUser(users[0]);
      const user = {
        id: users[0].id,
        email: users[0].email,
        phone: users[0].phone,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        status: users[0].status,
      };
      const tokenResponse: TokenResponse = { ...token, user: user };
      tokenService
        .refresh(token.refreshToken)
        .returns(Promise.resolve(tokenResponse));

      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `mutation { refresh(input: { refreshToken: "${token.refreshToken}"}) { accessToken refreshToken user { id, email, phone, firstName, lastName, status} }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.refresh).toEqual(tokenResponse);
        });
    });

    it('should logout the user', () => {
      const token = authenticationHelper.generateTokenForUser(users[0]);

      tokenService.resetToken(users[0].id).returns(Promise.resolve());

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          query: `mutation { logout }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.logout).toEqual(null);
        });
    });
  });
});
