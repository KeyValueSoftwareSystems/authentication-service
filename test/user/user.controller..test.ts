import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../src/user/user.service';
import Substitute, { Arg } from '@fluffy-spoon/substitute';
import User from '../../src/user/user.entity';
import { UserResolver } from '../../src/user/user.resolver';
import { AppGraphQLModule } from '../../src/graphql/graphql.module';
import { NewUserInput, UpdateUserInput } from '../../src/schema/graphql.schema';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    firstName: 'Test1',
    lastName: 'Test2',
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
        let obj = Object.create(null);        
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
        let obj = Object.create(null);   
        userService
          .updateUser("ae032b1b-cc3c-4e44-9197-276ca877a7f8", Object.assign(obj, input))
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
        const input: NewUserInput = {
          email: 'user@test.com',
          firstName: 'Test1',
          lastName: 'Test2',
        };
        userService
          .deleteUser("ae032b1b-cc3c-4e44-9197-276ca877a7f8")
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
    });
  });
});
