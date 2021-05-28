import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../../src/authorization/service/user.service';
import Substitute from '@fluffy-spoon/substitute';
import User from '../../../src/authorization/entity/user.entity';
import { UserResolver } from '../../../src/authorization/resolver/user.resolver';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import {
  NewUserInput,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
} from '../../../src/schema/graphql.schema';
import Group from 'src/authorization/entity/group.entity';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
  },
];

const permissions = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
    active: true,
  },
];

const groups: Group[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
    active: true,
  },
];
const gql = '/graphql';

const userService = Substitute.for<UserService>();

describe('User Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        UserResolver,
        { provide: 'UserService', useValue: userService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(gql, () => {
    describe('users', () => {
      it('should get the user array', () => {
        userService.getAllUsers().returns(Promise.resolve(users));
        return request(app.getHttpServer())
          .post(gql)
          .send({ query: '{getUsers {id email firstName lastName active }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getUsers).toEqual(users);
          });
      });

      it('should get single user', () => {
        userService
          .getUserById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              '{getUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id email firstName lastName active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getUser).toEqual(users[0]);
          });
      });

      it('should create a user', () => {
        const input: NewUserInput = {
          email: 'user@test.com',
          firstName: 'Test1',
          lastName: 'Test2',
        };
        const obj = Object.create(null);
        userService
          .createUser(Object.assign(obj, input))
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { createUser(input: {email: "user@test.com", firstName: "Test1", lastName: "Test2"}) {id email firstName lastName active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createUser).toEqual(users[0]);
          });
      });

      it('should update a user', () => {
        const input: UpdateUserInput = {
          firstName: 'Test1',
          lastName: 'Test2',
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
          .send({
            query:
              'mutation { updateUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {firstName: "Test1", lastName: "Test2"}) {id email firstName lastName active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateUser).toEqual(users[0]);
          });
      });

      it('should delete a user', () => {
        userService
          .deleteUser('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(users[0]));
        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { deleteUser(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id email firstName lastName active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deleteUser).toEqual(users[0]);
          });
      });

      it('should update user permissions', () => {
        const input: UpdateUserPermissionInput = {
          permissions: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
        };
        const obj = Object.create(null);
        userService
          .updateUserPermissions(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .resolves(permissions);

        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { updateUserPermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name active }}',
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body.data);
            expect(res.body.data.updateUserPermissions).toEqual(permissions);
          });
      });

      it('should update user groups', () => {
        const input: UpdateUserGroupInput = {
          groups: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
        };
        const obj = Object.create(null);
        userService
          .updateUserGroups(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .resolves(groups);

        return request(app.getHttpServer())
          .post(gql)
          .send({
            query:
              'mutation { updateUserGroups(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {groups: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name active }}',
          })
          .expect(200)
          .expect((res) => {
            console.log(res.body.data);
            expect(res.body.data.updateUserGroups).toEqual(permissions);
          });
      });
    });
  });
});
