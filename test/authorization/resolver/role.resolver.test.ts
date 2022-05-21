import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import * as request from 'supertest';
import {
  NewRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../../src/schema/graphql.schema';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import User from '../../../src/authorization/entity/user.entity';
import UserService from '../../../src/authorization/service/user.service';
import { mockedConfigService } from '../../utils/mocks/config.service';
import { RoleService } from '../../../src/authorization/service/role.service';
import { RoleResolver } from '../../../src/authorization/resolver/role.resolver';
import Role from '../../../src/authorization/entity/role.entity';

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
  },
];

const roles: Role[] = [
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
const roleService = Substitute.for<RoleService>();
describe('Role Module', () => {
  let app: INestApplication;

  const userService = Substitute.for<UserService>();
  let authenticationHelper: AuthenticationHelper;
  beforeAll(async () => {
    userService
      .verifyUserPermissions(Arg.any(), Arg.any(), Arg.any())
      .resolves(true);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        AuthenticationHelper,
        RoleResolver,
        { provide: 'RoleService', useValue: roleService },
        { provide: 'UserService', useValue: userService },
        { provide: 'ConfigService', useValue: mockedConfigService },
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
    describe('roles', () => {
      it('should get the roles', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);

        roleService.getAllRoles().returns(Promise.resolve(roles));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({ query: '{getRoles {id name }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getRoles).toEqual(roles);
          });
      });

      it('should get single role', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);

        roleService
          .getRoleById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(roles[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getRole(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getRole).toEqual(roles[0]);
          });
      });

      it('should create a role', () => {
        const input: NewRoleInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        const token = authenticationHelper.generateAccessToken(users[0]);

        roleService
          .createRole(Object.assign(obj, input))
          .returns(Promise.resolve(roles[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: 'mutation { createRole(input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createRole).toEqual(roles[0]);
          });
      });

      it('should update a role', () => {
        const input: UpdateRoleInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        const token = authenticationHelper.generateAccessToken(users[0]);

        roleService
          .updateRole(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .returns(Promise.resolve(roles[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateRole(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateRole).toEqual(roles[0]);
          });
      });

      it('should delete a role', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);

        roleService
          .deleteRole('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(roles[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deleteRole(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deleteRole).toEqual(roles[0]);
          });
      });
    });

    it('should update role permissions', () => {
      const input: UpdateRolePermissionInput = {
        permissions: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
      };
      const obj = Object.create(null);
      roleService
        .updateRolePermissions(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
          Object.assign(obj, input),
        )
        .resolves(permissions);

      const token = authenticationHelper.generateAccessToken(users[0]);

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query:
            'mutation { updateRolePermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name }}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateRolePermissions).toEqual(permissions);
        });
    });
  });
});
