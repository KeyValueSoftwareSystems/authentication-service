import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../../src/authorization/service/user.service';
import Substitute from '@fluffy-spoon/substitute';
import User from '../../../src/authorization/entity/user.entity';
import { UserResolver } from '../../../src/authorization/resolver/user.resolver';
import { AppGraphQLModule } from '../../../src/common/graphql/graphql.module';
import {
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  UserSignupResponse,
} from '../../../src/schema/graphql.schema';
import Group from '../../../src/authorization/entity/group.entity';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { ConfigService } from '@nestjs/config';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 'secret',
    firstName: 'Test',
    lastName: 'User',
    origin: 'simple',
  },
];

const usersInput: UserSignupResponse[] = [
  {
    id: users[0].id,
    email: users[0].email,
    phone: users[0].phone,
    firstName: users[0].firstName,
    lastName: users[0].lastName,
  },
];

const permissions = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];

const groups: Group[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];
const gql = '/graphql';

const userService = Substitute.for<UserService>();

describe('User Module', () => {
  let app: INestApplication;

  const configService = Substitute.for<ConfigService>();
  let authenticationHelper: AuthenticationHelper;
  beforeAll(async () => {
    configService.get('ENV').returns('local');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        UserResolver,
        AuthenticationHelper,
        { provide: 'ConfigService', useValue: configService },
        { provide: 'UserService', useValue: userService },
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
    describe('users', () => {
      it('should get the user array', () => {
        configService.get('JWT_SECRET').returns('s3cr3t1234567890');
        const token = authenticationHelper.generateAccessToken(users[0]);

        userService.getAllUsers().returns(Promise.resolve(users));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: '{getUsers { id email phone firstName lastName }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getUsers).toEqual(usersInput);
          });
      });

      it('should get single user', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);
        userService
          .getUserById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") { id email phone firstName lastName }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getUser).toEqual(usersInput[0]);
          });
      });

      it('should update a user', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);

        const input: UpdateUserInput = {
          firstName: 'Test',
          lastName: 'User',
        };
        const obj = Object.create(null);
        userService
          .updateUser(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {firstName: "Test", lastName: "User"}) {id email phone firstName lastName }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateUser).toEqual(usersInput[0]);
          });
      });

      it('should delete a user', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);
        userService
          .deleteUser('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deleteUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id email phone firstName lastName }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deleteUser).toEqual(usersInput[0]);
          });
      });

      it('should update user permissions', () => {
        const input: UpdateUserPermissionInput = {
          permissions: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
        };
        const token = authenticationHelper.generateAccessToken(users[0]);
        const obj = Object.create(null);
        userService
          .updateUserPermissions(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .resolves(permissions);

        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateUserPermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateUserPermissions).toEqual(permissions);
          });
      });

      it('should update user groups', () => {
        const input: UpdateUserGroupInput = {
          groups: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
        };
        const token = authenticationHelper.generateAccessToken(users[0]);
        const obj = Object.create(null);
        userService
          .updateUserGroups(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .resolves(groups);

        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateUserGroups(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {groups: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateUserGroups).toEqual(permissions);
          });
      });
    });
  });
});
