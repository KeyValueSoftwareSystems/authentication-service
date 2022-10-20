import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from '../../../src/schema/graphql.schema';
import Group from '../../../src/authorization/entity/group.entity';
import { GroupService } from '../../../src/authorization/service/group.service';
import Permission from '../../../src/authorization/entity/permission.entity';
import GroupPermission from '../../../src/authorization/entity/groupPermission.entity';
import { PermissionNotFoundException } from '../../../src/authorization/exception/permission.exception';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import UserGroup from '../../../src/authorization/entity/userGroup.entity';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';
import { ConfigService } from '@nestjs/config';
import GroupCacheService from '../../../src/authorization/service/groupcache.service';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Role from '../../../src/authorization/entity/role.entity';
import User from '../../../src/authorization/entity/user.entity';
import UserCacheService from '../../../src/authorization/service/usercache.service';
const groups: Group[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    name: 'Test1',
  },
];

const permissions: Permission[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    phone: '9112345678910',
    password: 'SecretPassword',
    firstName: 'Test1',
    lastName: 'Test2',
    origin: 'simple',
  },
];

describe('test Group Service', () => {
  let groupService: GroupService;
  const groupRepository = Substitute.for<Repository<Group>>();
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupPermissionRepository = Substitute.for<
    Repository<GroupPermission>
  >();
  const userGroupRepository = Substitute.for<Repository<UserGroup>>();
  const groupCacheService = Substitute.for<GroupCacheService>();
  const redisCacheService = Substitute.for<RedisCacheService>();
  const groupRoleRepository = Substitute.for<Repository<GroupRole>>();
  const userRepository = Substitute.for<Repository<User>>();
  const roleRepository = Substitute.for<Repository<Role>>();
  const connectionMock = Substitute.for<Connection>();
  const userCacheService = Substitute.for<UserCacheService>();
  const userQueryBuilder = Substitute.for<SelectQueryBuilder<User>>();
  const permissionQueryBuilder = Substitute.for<
    SelectQueryBuilder<Permission>
  >();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        GroupService,
        ConfigService,
        AuthenticationHelper,
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(GroupPermission),
          useValue: groupPermissionRepository,
        },
        {
          provide: getRepositoryToken(UserGroup),
          useValue: userGroupRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(GroupRole),
          useValue: groupRoleRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepository,
        },
        { provide: 'UserCacheService', useValue: userCacheService },
        { provide: 'GroupCacheService', useValue: groupCacheService },
        { provide: 'RedisCacheService', useValue: redisCacheService },
        {
          provide: Connection,
          useValue: connectionMock,
        },
      ],
    }).compile();
    groupService = moduleRef.get<GroupService>(GroupService);
  });

  it('should get all groups', async () => {
    groupRepository.find().returns(Promise.resolve(groups));
    const resp = await groupService.getAllGroups();
    expect(resp).toEqual(groups);
  });

  it('should get a group by id', async () => {
    groupRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(groups[0]));
    const resp = await groupService.getGroupById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should create a group', async () => {
    const input: NewGroupInput = {
      name: 'Test1',
    };
    groupRepository.create(input).returns(groups[0]);

    groupRepository.insert(groups[0]).returns(Arg.any());

    const resp = await groupService.createGroup(input);
    expect(resp).toEqual(groups[0]);
  });

  it('should update name of a group', async () => {
    const input: UpdateGroupInput = {
      name: 'Test1',
    };

    groupRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    const resp = await groupService.updateGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should update users in a group', async () => {
    const input: UpdateGroupInput = {
      users: ['ae032b1b-cc3c-4e44-9197-276ca877a7f8'],
    };

    userRepository.findByIds([users[0].id]).resolves(users);

    userRepository.createQueryBuilder('user').returns(userQueryBuilder);
    userQueryBuilder
      .leftJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId = user.id')
      .returns(userQueryBuilder);
    userQueryBuilder
      .where('userGroup.groupId = :groupId', {
        groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      })
      .returns(userQueryBuilder);
    userQueryBuilder.getMany().resolves(users);

    userGroupRepository.create(Arg.any()).returns({
      userId: users[0].id,
      groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    } as UserGroup);

    connectionMock.transaction(Arg.any()).resolves(Arg.any());

    const resp = await groupService.updateGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should add permissions to a group', async () => {
    const request = [
      {
        groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
      },
    ];
    const input: UpdateGroupPermissionInput = {
      permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
    };

    permissionRepository
      .findByIds(['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'])
      .resolves(permissions);

    groupPermissionRepository.create(request).returns(request);

    permissionRepository
      .createQueryBuilder('permission')
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .leftJoinAndSelect(
        GroupPermission,
        'groupPermission',
        'permission.id = groupPermission.permissionId',
      )
      .returns(permissionQueryBuilder);

    permissionQueryBuilder
      .where('groupPermission.groupId = :groupId', {
        groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      })
      .returns(permissionQueryBuilder);

    permissionQueryBuilder.getMany().resolves(permissions);

    connectionMock.transaction(Arg.any()).resolves(request);

    const resp = await groupService.updateGroupPermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(permissions);
  });

  it('should throw exception when adding invalid permissions to a group', async () => {
    const input: UpdateGroupPermissionInput = {
      permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
    };

    permissionRepository
      .findByIds(['3e9e78c9-3fcd-4eed-b027-62f794680b03'])
      .resolves([]);

    const resp = groupService.updateGroupPermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    await expect(resp).rejects.toThrowError(
      new PermissionNotFoundException(
        ['3e9e78c9-3fcd-4eed-b027-62f794680b03'].toString(),
      ),
    );
  });

  it('should delete a group', async () => {
    groupRepository
      .softDelete('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(Arg.any());
    userGroupRepository
      .count({
        where: { groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8' },
      })
      .resolves(0);
    const resp = await groupService.deleteGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(groups[0]);
  });
});
