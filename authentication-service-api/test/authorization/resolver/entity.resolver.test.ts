import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import * as request from 'supertest';
import {
  Entity,
  NewEntityInput,
  Status,
  UpdateEntityInput,
  UpdateEntityPermissionInput,
} from '../../../src/schema/graphql.schema';
import { EntityService } from '../../../src/authorization/service/entity.service';
import { EntityResolver } from '../../../src/authorization/resolver/entity.resolver';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import UserService from '../../../src/authorization/service/user.service';
import User from '../../../src/authorization/entity/user.entity';
import { mockedConfigService } from '../../utils/mocks/config.service';

const gql = '/graphql';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t1234567890',
    firstName: 'Test1',
    lastName: 'Test2',
    origin: 'simple',
    status: Status.ACTIVE,
  },
];

const entities: Entity[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];

const permissions = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];
const entityService = Substitute.for<EntityService>();
const userService = Substitute.for<UserService>();
describe('Entity Module', () => {
  let app: INestApplication;
  userService
    .verifyUserPermissions(Arg.any(), Arg.any(), Arg.any())
    .resolves(true);

  let token: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        EntityResolver,
        { provide: 'EntityService', useValue: entityService },
        { provide: 'UserService', useValue: userService },
        { provide: 'ConfigService', useValue: mockedConfigService },
        AuthenticationHelper,
      ],
    }).compile();

    const authenticationHelper = moduleFixture.get<AuthenticationHelper>(
      AuthenticationHelper,
    );
    app = moduleFixture.createNestApplication();
    await app.init();
    token = authenticationHelper.generateAccessToken(users[0]);
  });

  afterAll(async () => {
    await app.close();
  });
  describe(gql, () => {
    describe('entities', () => {
      it('should get the entities', () => {
        entityService.getAllEntities().returns(Promise.resolve(entities));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({ query: '{getEntities {id name }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getEntities).toEqual(entities);
          });
      });

      it('should get single entity', () => {
        entityService
          .getEntityById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(entities[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getEntity(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getEntity).toEqual(entities[0]);
          });
      });

      it('should create an entity', () => {
        const input: NewEntityInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        entityService
          .createEntity(Object.assign(obj, input))
          .returns(Promise.resolve(entities[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { createEntity(input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createEntity).toEqual(entities[0]);
          });
      });

      it('should update an entity', () => {
        const input: UpdateEntityInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        entityService
          .updateEntity(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .returns(Promise.resolve(entities[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateEntity(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateEntity).toEqual(entities[0]);
          });
      });

      it('should delete a entity', () => {
        entityService
          .deleteEntity('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(entities[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deleteEntity(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deleteEntity).toEqual(entities[0]);
          });
      });
    });

    it('should update entity permissions', () => {
      const input: UpdateEntityPermissionInput = {
        permissions: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
      };
      const obj = Object.create(null);
      entityService
        .updateEntityPermissions(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
          Object.assign(obj, input),
        )
        .resolves(permissions);

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query:
            'mutation { updateEntityPermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name }}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateEntityPermissions).toEqual(permissions);
        });
    });
  });
});
