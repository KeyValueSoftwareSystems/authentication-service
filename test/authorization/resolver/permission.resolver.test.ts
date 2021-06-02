import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import * as request from 'supertest';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';
import { PermissionService } from '../../../src/authorization/service/permission.service';
import Permission from '../../../src/authorization/entity/permission.entity';
import { PermissionResolver } from '../../../src/authorization/resolver/permission.resolver';

const gql = '/graphql';

const permissions: Permission[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
    active: true,
  },
];
const permissionService = Substitute.for<PermissionService>();
describe('Permission Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        PermissionResolver,
        { provide: 'PermissionService', useValue: permissionService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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
          .send({ query: '{getPermissions {id name active }}' })
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
          .send({
            query:
              '{getPermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name active }}',
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
          .send({
            query:
              'mutation { createPermission(input: {name: "Test1"}) {id name active }}',
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
          .send({
            query:
              'mutation { updatePermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name active }}',
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
          .send({
            query:
              'mutation { deletePermission(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deletePermission).toEqual(permissions[0]);
          });
      });
    });
  });
});
