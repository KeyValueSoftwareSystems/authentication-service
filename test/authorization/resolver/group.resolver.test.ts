import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppGraphQLModule } from '../../../src/graphql/graphql.module';
import Group from '../../../src/authorization/entity/group.entity';
import { GroupService } from '../../../src/authorization/service/group.service';
import { GroupResolver } from '../../../src/authorization/resolver/group.resolver';
import * as request from 'supertest';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from '../../../src/schema/graphql.schema';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import User from '../../../src/authorization/entity/user.entity';
import UserServiceInterface from '../../../src/authorization/service/user.service.interface';
import { mockedConfigService } from '../../utils/mocks/config.service';
import Role from 'src/authorization/entity/role.entity';
import * as GqlSchema from '../../../src/schema/graphql.schema';
import Permission from 'src/authorization/entity/permission.entity';

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
    status: GqlSchema.Status.ACTIVE,
  },
];

const groups: Group[] = [
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
const groupService = Substitute.for<GroupService>();
describe('Group Module', () => {
  let app: INestApplication;

  const userService = Substitute.for<UserServiceInterface>();
  let authenticationHelper: AuthenticationHelper;
  beforeAll(async () => {
    userService
      .verifyUserPermissions(Arg.any(), Arg.any(), Arg.any())
      .resolves(true);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        AuthenticationHelper,
        GroupResolver,
        { provide: 'GroupService', useValue: groupService },
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
    describe('groups', () => {
      it('should get the groups', () => {
        const permissions: Permission[] = [
          {
            id: '6fcec8dd-196e-4649-a607-7085bf4032a3',
            name: 'Edit-Roles',
          },
        ];
        const groupRoles: Role[] = [
          {
            id: 'f56bc83b-b163-4fa0-a685-c0fa0926614c',
            name: 'Test Group Role',
          },
        ];
        const allPermissions: Permission[] = [
          {
            id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
            name: 'Edit-Roles',
          },
          {
            id: 'a36fc502-7307-4bef-aa53-975a700e5159',
            name: 'Create-Roles',
          },
        ];
        const response: GqlSchema.GroupPaginated = {
          totalCount: 1,
          results: [
            {
              id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
              name: 'Customers',
              roles: [
                {
                  id: 'f56bc83b-b163-4fa0-a685-c0fa0926614c',
                  name: 'Test Group Role',
                },
              ],
              permissions: [
                {
                  id: '6fcec8dd-196e-4649-a607-7085bf4032a3',
                  name: 'Edit-Roles',
                },
              ],
              allPermissions: [
                {
                  id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
                  name: 'Edit-Roles',
                },
                {
                  id: 'a36fc502-7307-4bef-aa53-975a700e5159',
                  name: 'Create-Roles',
                },
              ],
            },
          ],
        };
        const token = authenticationHelper.generateAccessToken(users[0]);
        groupService
          .getGroupPermissions(groups[0].id)
          .returns(Promise.resolve(permissions));
        groupService
          .getGroupRoles(groups[0].id)
          .returns(Promise.resolve(groupRoles));
        groupService
          .getAllGroupPermissions(groups[0].id)
          .returns(Promise.resolve(allPermissions));
        groupService.getAllGroups().returns(Promise.resolve([groups, 1]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getGroups { totalCount results { id name permissions{id name} roles{ id name } allPermissions{ id name }}}}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getGroups).toEqual(response);
          });
      });

      it('should get single group', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);
        const group: Group = {
          id: '4a3c33a9-983e-44c0-ad22-bdc5a84c2c75',
          name: 'Customers',
        };
        const permissions: Permission[] = [
          {
            id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
            name: 'Edit-Roles',
          },
        ];
        const groupRoles: Role[] = [
          {
            id: '9942109f-026b-4f2f-a26f-5ceb5f911ba6',
            name: 'Test Group Role',
          },
        ];
        const allPermissions: Permission[] = [
          {
            id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
            name: 'Edit-Roles',
          },
          {
            id: 'a36fc502-7307-4bef-aa53-975a700e5159',
            name: 'Create-Roles',
          },
        ];
        const response: GqlSchema.Group = {
          id: '4a3c33a9-983e-44c0-ad22-bdc5a84c2c75',
          name: 'Customers',
          roles: [
            {
              id: '9942109f-026b-4f2f-a26f-5ceb5f911ba6',
              name: 'Test Group Role',
            },
          ],
          permissions: [
            {
              id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
              name: 'Edit-Roles',
            },
          ],
          allPermissions: [
            {
              id: '48ef52c3-2ca7-4453-80fb-7c170affd6da',
              name: 'Edit-Roles',
            },
            {
              id: 'a36fc502-7307-4bef-aa53-975a700e5159',
              name: 'Create-Roles',
            },
          ],
        };
        groupService.getGroupById(group.id).returns(Promise.resolve(group));
        groupService
          .getGroupPermissions(group.id)
          .returns(Promise.resolve(permissions));
        groupService
          .getGroupRoles(group.id)
          .returns(Promise.resolve(groupRoles));
        groupService
          .getAllGroupPermissions(group.id)
          .returns(Promise.resolve(allPermissions));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getGroup(id: "4a3c33a9-983e-44c0-ad22-bdc5a84c2c75") {id name permissions{ id name } roles{ id name } allPermissions{ id name }}}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getGroup).toEqual(response);
          });
      });

      it('should create a group', () => {
        const input: NewGroupInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        const token = authenticationHelper.generateAccessToken(users[0]);

        groupService
          .createGroup(Object.assign(obj, input))
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query: 'mutation { createGroup(input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createGroup).toEqual(groups[0]);
          });
      });

      it('should update a group', () => {
        const input: UpdateGroupInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        const token = authenticationHelper.generateAccessToken(users[0]);

        groupService
          .updateGroup(
            'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
            Object.assign(obj, input),
          )
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { updateGroup(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateGroup).toEqual(groups[0]);
          });
      });

      it('should delete a group', () => {
        const token = authenticationHelper.generateAccessToken(users[0]);

        groupService
          .deleteGroup('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deleteGroup(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.deleteGroup).toEqual(groups[0]);
          });
      });
    });

    it('should update group permissions', () => {
      const input: UpdateGroupPermissionInput = {
        permissions: ['5824f3b8-ca41-4af6-8d5f-10e6266d6ddf'],
      };
      const obj = Object.create(null);
      groupService
        .updateGroupPermissions(
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
            'mutation { updateGroupPermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name }}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateGroupPermissions).toEqual(permissions);
        });
    });

    it('should get a single group with role', () => {
      const users: User[] = [
        {
          id: 'bac64eea-2e51-4397-ae5b-ce8d94d5dcc9',
          email: 'user@test.com',
          phone: '91123456988910',
          password: 's3cr3t1234567890',
          firstName: 'Test1',
          lastName: 'Test2',
          origin: 'simple',
          status: GqlSchema.Status.ACTIVE,
        },
      ];
      const groupInPayload: Group[] = [
        {
          id: '836cccce-8ff6-40e9-9fc7-2dd5cba3f514',
          name: 'HR',
        },
      ];
      const roles: Role[] = [
        {
          id: 'fcd858c6-26c5-462b-8c53-4b544830dca8',
          name: 'Customers',
        },
      ];
      const groups: GqlSchema.Group[] = [
        {
          id: '836cccce-8ff6-40e9-9fc7-2dd5cba3f514',
          name: 'HR',
          roles: roles,
        },
      ];
      const token = authenticationHelper.generateAccessToken(users[0]);

      groupService
        .getGroupById('836cccce-8ff6-40e9-9fc7-2dd5cba3f514')
        .returns(Promise.resolve(groupInPayload[0]));
      groupService
        .getGroupRoles('836cccce-8ff6-40e9-9fc7-2dd5cba3f514')
        .returns(Promise.resolve(roles));
      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query:
            ' { getGroup(id: "836cccce-8ff6-40e9-9fc7-2dd5cba3f514") {id name roles{ id name }}}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getGroup).toEqual(groups[0]);
        });
    });
  });
});
