import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import UserService from '../../src/user/user.service';
import Substitute from '@fluffy-spoon/substitute';
import User from '../../src/user/user.entity';
import { UserResolver } from '../../src/user/user.resolver';
import { AppGraphQLModule } from '../../src/graphql/graphql.module';

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

let userService = Substitute.for<UserService>();

describe('User Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [UserResolver, {provide: 'UserService', useValue: userService}]
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
        userService.getAllUsers().returns(Promise.resolve(users))
        return request(app.getHttpServer())
          .post(gql)
          .send({ query: '{getUsers {id email firstName lastName active }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getUsers).toEqual(users);
          });
      });
    });
  });
});
