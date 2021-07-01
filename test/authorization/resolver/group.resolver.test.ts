import Substitute from '@fluffy-spoon/substitute';
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
import { ConfigService } from '@nestjs/config';
import User from '../../../src/authorization/entity/user.entity';

const gql = '/graphql';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 's3cr3t1234567890',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
    updatedDate: new Date(),
    origin: 'simple',
  },
];

const groups: Group[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
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
const groupService = Substitute.for<GroupService>();
describe('Group Module', () => {
  let app: INestApplication;

  const configService = Substitute.for<ConfigService>();
  let authenticationHelper: AuthenticationHelper;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppGraphQLModule],
      providers: [
        AuthenticationHelper,
        GroupResolver,
        { provide: 'ConfigService', useValue: configService },
        { provide: 'GroupService', useValue: groupService },
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
        configService.get('JWT_SECRET').returns('s3cr3t1234567890');
        const tokenResponse = authenticationHelper.createToken(users[0]);
        const token = tokenResponse.token;

        groupService.getAllGroups().returns(Promise.resolve(groups));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({ query: '{getGroups {id name active }}' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getGroups).toEqual(groups);
          });
      });

      it('should get single group', () => {
        const tokenResponse = authenticationHelper.createToken(users[0]);
        const token = tokenResponse.token;

        groupService
          .getGroupById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              '{getGroup(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.getGroup).toEqual(groups[0]);
          });
      });

      it('should create a group', () => {
        const input: NewGroupInput = {
          name: 'Test1',
        };
        const obj = Object.create(null);
        const tokenResponse = authenticationHelper.createToken(users[0]);
        const token = tokenResponse.token;

        groupService
          .createGroup(Object.assign(obj, input))
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { createGroup(input: {name: "Test1"}) {id name active }}',
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
        const tokenResponse = authenticationHelper.createToken(users[0]);
        const token = tokenResponse.token;

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
              'mutation { updateGroup(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {name: "Test1"}) {id name active }}',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.updateGroup).toEqual(groups[0]);
          });
      });

      it('should delete a group', () => {
        const tokenResponse = authenticationHelper.createToken(users[0]);
        const token = tokenResponse.token;

        groupService
          .deleteGroup('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
          .returns(Promise.resolve(groups[0]));
        return request(app.getHttpServer())
          .post(gql)
          .set('Authorization', `Bearer ${token}`)
          .send({
            query:
              'mutation { deleteGroup(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8") {id name active }}',
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

      const tokenResponse = authenticationHelper.createToken(users[0]);
      const token = tokenResponse.token;

      return request(app.getHttpServer())
        .post(gql)
        .set('Authorization', `Bearer ${token}`)
        .send({
          query:
            'mutation { updateGroupPermissions(id: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", input: {permissions: ["5824f3b8-ca41-4af6-8d5f-10e6266d6ddf"]}) {id name active }}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateGroupPermissions).toEqual(permissions);
        });
    });
  });
});
