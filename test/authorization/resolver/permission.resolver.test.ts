import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import Permission from '../../../src/authorization/entity/permission.entity';
import User from '../../../src/authorization/entity/user.entity';
import { PermissionResolver } from '../../../src/authorization/resolver/permission.resolver';
import { PermissionServiceInterface } from '../../../src/authorization/service/permission.service.interface';
import { UserServiceInterface } from '../../../src/authorization/service/user.service.interface';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import {
  NewPermissionInput,
  Status,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';
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
const permissions: Permission[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];
const permissionService = Substitute.for<PermissionServiceInterface>();
const userService = Substitute.for<UserServiceInterface>();

describe('Permission Module', () => {
  let app: INestApplication;
  let token: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        PermissionResolver,
        { provide: PermissionServiceInterface, useValue: permissionService },
        { provide: UserServiceInterface, useValue: userService },
        { provide: ConfigService, useValue: mockedConfigService },
        AuthenticationHelper,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    const authenticationHelper = moduleFixture.get<AuthenticationHelper>(
      AuthenticationHelper,
    );
    token = authenticationHelper.generateAccessToken(users[0]);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('gql', () => {
    describe('permissions', () => {
      it('should get the permissions', () => {
        permissionService
          .getAllPermissions()
          .returns(Promise.resolve(permissions));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({ query: '{getPermissions {id name }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getPermissions).toEqual(permissions);
          });
      });

      it('should get single permission', () => {
        permissionService
          .getPermissionById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(permissions[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getPermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getPermission).toEqual(permissions[0]);
          });
      });

      it('should create a permission', () => {
        const input: NewPermissionInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        permissionService
          .createPermission(Object.assign(obj, input))
          .returns(Promise.resolve(permissions[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { createPermission(input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createPermission).toEqual(permissions[0]);
          });
      });

      it('should update a permission', () => {
        const input: UpdatePermissionInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        permissionService
          .updatePermission(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .returns(Promise.resolve(permissions[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updatePermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updatePermission).toEqual(permissions[0]);
          });
      });

      it('should delete a permission', () => {
        permissionService
          .deletePermission(Arg.any())
          .returns(Promise.resolve(permissions[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deletePermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deletePermission).toEqual(permissions[0]);
          });
      });
    });
  });
});
