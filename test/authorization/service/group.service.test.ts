import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import {
  NewGroupInput,
  Status,
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
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Role from '../../../src/authorization/entity/role.entity';
import User from '../../../src/authorization/entity/user.entity';
import UserCacheService from '../../../src/authorization/service/usercache.service';
import SearchService from '../../../src/authorization/service/search.service';
import RolePermission from '../../../src/authorization/entity/rolePermission.entity';
import { GroupServiceInterface } from '../../../src/authorization/service/group.service.interface';
import { GroupCacheServiceInterface } from '../../../src/authorization/service/groupcache.service.interface';
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
    label: 'Customers',
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
    status: Status.ACTIVE,
  },
];

describe('test Group Service', () => {
  let groupService: GroupServiceInterface;
  const groupRepository = Substitute.for<Repository<Group>>();
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupPermissionRepository = Substitute.for<
    Repository<GroupPermission>
  >();
  const userGroupRepository = Substitute.for<Repository<UserGroup>>();
  const groupCacheService = Substitute.for<GroupCacheServiceInterface>();
  const redisCacheService = Substitute.for<RedisCacheService>();
  const groupRoleRepository = Substitute.for<Repository<GroupRole>>();
  const userRepository = Substitute.for<Repository<User>>();
  const roleRepository = Substitute.for<Repository<Role>>();
  const connectionMock = Substitute.for<Connection>();
  const userCacheService = Substitute.for<UserCacheService>();
  const searchService = Substitute.for<SearchService>();
  const userQueryBuilder = Substitute.for<SelectQueryBuilder<User>>();
  const permissionQueryBuilder = Substitute.for<
    SelectQueryBuilder<Permission>
  >();
  const roleQueryBuilder = Substitute.for<SelectQueryBuilder<Role>>();
  const groupQueryBuilder = Substitute.for<SelectQueryBuilder<Group>>();
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
        { provide: UserCacheService, useValue: userCacheService },
        { provide: GroupCacheServiceInterface, useValue: groupCacheService },
        { provide: RedisCacheService, useValue: redisCacheService },
        { provide: SearchService, useValue: searchService },
        {
          provide: Connection,
          useValue: connectionMock,
        },
      ],
    }).compile();
    groupService = moduleRef.get<GroupServiceInterface>(GroupService);
  });

  it('should get all groups', async () => {
    groupRepository.createQueryBuilder().returns(groupQueryBuilder);
    groupQueryBuilder.getManyAndCount().returns(Promise.resolve([groups, 1]));
    const resp = await groupService.getAllGroups();
    expect(resp).toEqual([groups, 1]);
  });

  it('should get a group by id', async () => {
    groupRepository
      .findOneBy({ id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8' })
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
    userRepository.createQueryBuilder().returns(userQueryBuilder);
    userQueryBuilder
      .innerJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId=User.id')
      .returns(userQueryBuilder);
    userQueryBuilder
      .where('userGroup.groupId = :id', {
        id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      })
      .returns(userQueryBuilder);
    userQueryBuilder.getCount().resolves(0);
    const resp = await groupService.deleteGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should get group roles', async () => {
    const roles: Role[] = [
      {
        id: 'fcd858c6-26c5-462b-8c53-4b544830dca8',
        name: 'Role1',
      },
    ];
    roleRepository.createQueryBuilder('role').returns(roleQueryBuilder);
    roleQueryBuilder
      .leftJoinAndSelect(GroupRole, 'groupRole', 'role.id = groupRole.roleId')
      .returns(roleQueryBuilder);
    roleQueryBuilder
      .where('groupRole.groupId = :groupId', {
        groupId: '356c00da-7356-4b66-bc9c-901ad0ede230',
      })
      .returns(roleQueryBuilder);
    roleQueryBuilder.getMany().resolves(roles);
    const resp = await groupService.getGroupRoles(
      '356c00da-7356-4b66-bc9c-901ad0ede230',
    );
    expect(resp).toEqual(roles);
  });

  it('should get group permissions', async () => {
    const group: Group = {
      id: '09f7f119-c14b-4c37-ac1f-aae57d7bdbe5',
      name: 'Test1',
    };

    const permissions: Permission[] = [
      {
        id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
        name: 'Customers',
        label: 'Customers',
      },
    ];
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
        groupId: group.id,
      })
      .returns(permissionQueryBuilder);
    const resp = await groupService.getGroupPermissions(group.id);
    expect(resp).toEqual(permissions);
  });

  it('should get all group permissions', async () => {
    const group: Group = {
      id: '09f7f119-c14b-4c37-ac1f-aae57d7bdbe5',
      name: 'Test1',
    };
    const permissionsOfGroup: Permission[] = [
      {
        id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
        name: 'Customers',
        label: 'Customers',
      },
    ];
    const rolePermissionsOfGroup: Permission[] = [
      {
        id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
        name: 'Customers',
        label: 'Customers',
      },
    ];
    const resp = await groupService.getGroupPermissions(group.id);
    expect(resp).toEqual(permissionsOfGroup);
    permissionRepository
      .createQueryBuilder('permission')
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .innerJoin(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .innerJoin(
        GroupRole,
        'groupRole',
        'rolePermission.roleId = groupRole.roleId',
      )
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .where('groupRole.groupId = :groupId', {
        groupId: group.id,
      })
      .returns(permissionQueryBuilder);
    const allPermissionsOfGroup = permissionsOfGroup.concat(
      rolePermissionsOfGroup,
    );
    const permissionIds = allPermissionsOfGroup.map(
      (permission) => permission.id,
    );
    const filteredPermissions = allPermissionsOfGroup.filter(
      ({ id }, index) => !permissionIds.includes(id, index + 1),
    );
    const finalResponse = await groupService.getAllGroupPermissions(group.id);
    expect(finalResponse).toEqual(filteredPermissions);
  });
});
