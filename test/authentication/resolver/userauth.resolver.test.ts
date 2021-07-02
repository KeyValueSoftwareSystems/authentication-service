import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../../src/authorization/service/user.service';
import Substitute, { Arg } from '@fluffy-spoon/substitute';
import User from '../../../src/authorization/entity/user.entity';
import { UserResolver } from '../../../src/authorization/resolver/user.resolver';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import {
  UserLoginInput,
  UserSignupInput,
  UserSignupResponse,
} from '../../../src/schema/graphql.schema';
import UserauthService from '../../../src/authentication/service/userauth.service';
import UserauthResolver from '../../../src/authentication/resolver/userauth.resolver';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { ConfigService } from '@nestjs/config';
import UserCacheService from '../../../src/authorization/service/usercache.service';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t1234567890',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
    updatedDate: new Date(),
    origin: 'simple',
  },
];

const gql = '/graphql';

const userService = Substitute.for<UserService>();
const userauthService = Substitute.for<UserauthService>();
const userCacheService = Substitute.for<UserCacheService>();
const redisCacheService = Substitute.for<RedisCacheService>();

describe('Userauth Module', () => {
  let app: INestApplication;
  let authenticationHelper: AuthenticationHelper;
  const configService = Substitute.for<ConfigService>();
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        UserResolver,
        UserauthResolver,
        ConfigService,
        AuthenticationHelper,
        { provide: 'UserService', useValue: userService },
        { provide: 'UserauthService', useValue: userauthService },
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

  describe(gql, () => {
    describe('userauth', () => {
      it('should login a user', () => {
        const input: UserLoginInput = {
          username: 'user@test.com',
          password: 's3cr3t1234567890',
        };
        const tokenResponse = {
          expiresInSeconds: 3600,
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
          eyJ1c2VybmFtZSI6Inh5ekBrZXl2YWx1ZS5zeXN0ZW1zI
          iwiaWF0IjoxNjIxNTI1NTE1LCJleHAiOjE2MjE1MjkxMT
          V9.t8z7rBZKkog-1jirScYU6HE7KVTzatKWjZw8lVz3xLo`,
        };
        const obj = Object.create(null);
        userauthService
          .userLogin(Object.assign(obj, input))
          .returns(Promise.resolve(tokenResponse));
        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { login(input: { username: "user@test.com" password: "s3cr3t1234567890" }) { expiresInSeconds token }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.login).toHaveProperty(
              'expiresInSeconds',
              3600,
            );
            expect(res.body.data.login).toHaveProperty('token');
          });
      });
    });

    it('should signup a user', () => {
      const userInput: UserSignupInput[] = [
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
          active: users[0].active,
        },
      ];

      const obj = Object.create(null);
      userauthService
        .userSignup(Object.assign(obj, userInput[0]))
        .returns(Promise.resolve(usersResponse[0]));
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: `mutation { signup(input: { email: "user@test.com" 
          phone: "9112345678910" password: "s3cr3t1234567890" 
          firstName: "Test1" lastName: "Test2" }) { id email phone firstName lastName active }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.signup).toEqual(usersResponse[0]);
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
          active: users[0].active,
        },
      ];

      configService.get('JWT_SECRET').returns('s3cr3t1234567890');

      const tokenResponse = authenticationHelper.createToken(users[0]);
      const token = tokenResponse.token;

      userauthService
        .updatePassword(Arg.any(), Arg.any())
        .returns(Promise.resolve(users[0]));
      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation { changePassword(input: { currentPassword: "s3cr3t1234567890" 
          newPassword: "1234567890s3cr3t" }) { id email phone firstName lastName active }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.changePassword).toEqual(usersResponse[0]);
        });
    });
  });
});
