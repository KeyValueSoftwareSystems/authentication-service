import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/schema/graphql.schema';
import { INestApplication } from '@nestjs/common';

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

describe('User Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
