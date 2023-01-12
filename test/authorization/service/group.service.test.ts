import { Substitute } from '@fluffy-spoon/substitute';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import Group from '../../../src/authorization/entity/group.entity';
import GroupPermission from '../../../src/authorization/entity/groupPermission.entity';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Permission from '../../../src/authorization/entity/permission.entity';
import Role from '../../../src/authorization/entity/role.entity';
import User from '../../../src/authorization/entity/user.entity';
import { GroupNotFoundException } from '../../../src/authorization/exception/group.exception';
import { GroupRepository } from '../../../src/authorization/repository/group.repository';
import { UserRepository } from '../../../src/authorization/repository/user.repository';
import { UserGroupRepository } from '../../../src/authorization/repository/userGroup.repository';
import { GroupService } from '../../../src/authorization/service/group.service';
import GroupCacheService from '../../../src/authorization/service/groupcache.service';
import SearchService from '../../../src/authorization/service/search.service';
import UserCacheService from '../../../src/authorization/service/usercache.service';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';
import {
  NewGroupInput,
  Status,
  UpdateGroupInput,
} from '../../../src/schema/graphql.schema';

const VALID_GROUP_ID = '3282163d-fd5a-4026-b912-1a9cc5eefc98';
const groups: Group[] = [
  {
    id: VALID_GROUP_ID,
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
  let groupService: GroupService;
  let groupRepository: GroupRepository;
  let userRepository: UserRepository;
  let userGroupRepository: UserGroupRepository;

  let dataSource: DataSource;

  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupPermissionRepository = Substitute.for<
    Repository<GroupPermission>
  >();

  const groupCacheService = Substitute.for<GroupCacheService>();
  const redisCacheService = Substitute.for<RedisCacheService>();
  const groupRoleRepository = Substitute.for<Repository<GroupRole>>();
  const roleRepository = Substitute.for<Repository<Role>>();
  const userCacheService = Substitute.for<UserCacheService>();
  const searchService = Substitute.for<SearchService>();
  const userQueryBuilder = Substitute.for<SelectQueryBuilder<User>>();
  const permissionQueryBuilder = Substitute.for<
    SelectQueryBuilder<Permission>
  >();
  const roleQueryBuilder = Substitute.for<SelectQueryBuilder<Role>>();

  let createQueryBuilderMock: jest.Mock;
  let getManyAndCountMock: jest.Mock;
  let getGroupByIdMock: jest.Mock;
  let saveMock: jest.Mock;
  let updateGroupByIdMock: jest.Mock;
  let getUsersByIdsMock: jest.Mock;
  let getUsersByGroupIdMock: jest.Mock;
  let userGroupCreateMock: jest.Mock;
  let userGroupRemoveMock: jest.Mock;
  let userGroupSaveMock: jest.Mock;

  let getRepositoryMock: jest.Mock;

  const mockDataSource = {
    createEntityManager: jest.fn(),
    transaction: jest.fn(),
    // manager: {
    //   transaction: jest.fn().mockImplementation(() => {
    //     entityManager: {
    //       getRepository: jest.fn().mockImplementation(() => {
    //         remove: userGroupRemoveMock = jest.fn();
    //         save: userGroupSaveMock = jest.fn();
    //       });
    //     }
    //   }),
    // },
  };

  // let dataSourceMockFactory: jest.Mock;
  // dataSourceMockFactory = jest.fn(() => ({
  //   manager: {
  //     transaction: jest.fn().mockImplementation((entityManager) => {
  //       entityManager: jest.Mock  = {
  //         getRepository: getRepositoryMock = jest.fn().mockImplementation(() => ({
  //           remove: userGroupRemoveMock = jest.fn(),
  //           save: userGroupSaveMock = jest.fn(),
  //         })),
  //       }
  //     }),
  //   }
  // }));

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        GroupService,
        ConfigService,
        AuthenticationHelper,
        GroupRepository,
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(GroupPermission),
          useValue: groupPermissionRepository,
        },
        UserGroupRepository,
        UserRepository,
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
        { provide: 'SearchService', useValue: searchService },
        // {
        //   provide: DataSource,
        //   useFactory: dataSourceMockFactory,
        // },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    groupService = moduleRef.get(GroupService);
    groupRepository = moduleRef.get(GroupRepository);
    userRepository = moduleRef.get(UserRepository);
    userGroupRepository = moduleRef.get(UserGroupRepository);
    dataSource = moduleRef.get(DataSource);

    createQueryBuilderMock = groupRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: (getManyAndCountMock = jest.fn()),
      });

    getGroupByIdMock = groupRepository.getGroupById = jest.fn();
    saveMock = groupRepository.save = jest.fn();
    updateGroupByIdMock = groupRepository.updateGroupById = jest.fn();
    getUsersByIdsMock = userRepository.getUsersByIds = jest.fn();
    getUsersByGroupIdMock = userRepository.getUsersByGroupId = jest.fn();
    userGroupCreateMock = userGroupRepository.create = jest.fn();
    userGroupRemoveMock = userGroupRepository.remove = jest.fn();
    userGroupSaveMock = userGroupRepository.save = jest.fn();

    // const repositoryMap = new Map<any, any>([
    //   [UserGroupRepository, userGroupRepository],
    //   // [GroupRepository, groupRepository],
    //   // [GroupRoleRepository, groupRoleRepository],
    //   // [GroupPermissionRepository, groupPermissionRepository],
    // ]);
    // getRepositoryMock = jest
    //   .fn()
    //   .mockImplementation((type) => repositoryMap.get(type));
    // // const manager: any = { getRepository: getRepositoryMock };
    // jest.spyOn(dataSource.manager, 'transaction').mockReturnValue({
    //   getRepository: (getRepositoryMock = jest.fn()),
    // } as any);
  });

  describe('getAllGroups', () => {
    it('should get all groups when no parameters are passed', async () => {
      getManyAndCountMock.mockReturnValue([groups, 1]);

      const result = await groupService.getAllGroups();

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('group');

      expect(getManyAndCountMock).toBeCalledTimes(1);

      expect(result).toEqual([groups, 1]);
    });
  });

  describe('getGroupById', () => {
    it('should get a group for valid id', async () => {
      getGroupByIdMock.mockResolvedValue(groups[0]);

      const result = await groupService.getGroupById(
        '3282163d-fd5a-4026-b912-1a9cc5eefc98',
      );

      expect(getGroupByIdMock).toBeCalledWith(VALID_GROUP_ID);

      expect(result).toEqual(groups[0]);
    });

    it('should throw exception for invalid id', async () => {
      getGroupByIdMock.mockResolvedValue(null);

      try {
        await groupService.getGroupById('ae032b1b-cc3c-4e44-9197-276ca877a7f9');
      } catch (error) {
        expect(getGroupByIdMock).toBeCalledWith(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f9',
        );

        expect(error).toBeInstanceOf(GroupNotFoundException);
      }
    });
  });

  describe('createGroup', () => {
    it('should create a group', async () => {
      const input: NewGroupInput = {
        name: 'Test1',
      };

      saveMock.mockResolvedValue(groups[0]);

      const result = await groupService.createGroup(input);

      expect(saveMock).toBeCalledWith(input);

      expect(result).toEqual(groups[0]);
    });
  });

  describe('updateGroup', () => {
    it('should update name of a group', async () => {
      const input: UpdateGroupInput = {
        name: 'Test1',
      };

      updateGroupByIdMock.mockResolvedValue(true);
      getGroupByIdMock.mockResolvedValue(groups[0]);

      const result = await groupService.updateGroup(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        input,
      );

      expect(updateGroupByIdMock).toBeCalledWith(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        input,
      );
      expect(getGroupByIdMock).toBeCalledWith(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      );

      expect(result).toEqual(groups[0]);
    });

    // it('should update users in a group', async () => {
    //   const input: UpdateGroupInput = {
    //     users: ['ccecef4f-58d3-477b-87ee-847ee22efe4d'],
    //   };

    //   updateGroupByIdMock.mockResolvedValue(true);
    //   getGroupByIdMock.mockResolvedValue(groups[0]);
    //   getUsersByIdsMock.mockResolvedValue([
    //     {
    //       id: 'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //       firstName: 'New1',
    //       lastName: 'New2',
    //       origin: 'simple',
    //       status: Status.ACTIVE,
    //     },
    //   ]);
    //   getUsersByGroupIdMock.mockResolvedValue(users);
    //   userGroupCreateMock.mockResolvedValue({
    //     userId: 'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //     groupId: '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //   });
    //   // getRepositoryMock.mockResolvedValue(UserGroupRepository);
    //   userGroupRemoveMock.mockResolvedValue({
    //     userId: users[0].id,
    //     groupId: '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //   });
    //   userGroupSaveMock.mockResolvedValue({
    //     userId: 'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //     groupId: '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //   });

    //   // dataSource.manager.transaction = jest.fn().mockImplementation();

    //   const result = await groupService.updateGroup(
    //     '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //     input,
    //   );

    //   expect(updateGroupByIdMock).toBeCalledWith(VALID_GROUP_ID, input);
    //   expect(getGroupByIdMock).toBeCalledWith(VALID_GROUP_ID);
    //   expect(getUsersByIdsMock).toBeCalledWith([
    //     'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //   ]);
    //   expect(getUsersByGroupIdMock).toBeCalledWith(VALID_GROUP_ID);
    //   expect(userGroupCreateMock).toBeCalledWith([
    //     {
    //       userId: 'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //       groupId: VALID_GROUP_ID,
    //     },
    //   ]);
    //   // expect(userGroupRemoveMock).toBeCalledWith([
    //   //   {
    //   //     userId: users[0].id,
    //   //     groupId: '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //   //   },
    //   // ]);
    //   // expect(userGroupSaveMock).toBeCalledWith([
    //   //   {
    //   //     userId: 'ccecef4f-58d3-477b-87ee-847ee22efe4d',
    //   //     groupId: '3282163d-fd5a-4026-b912-1a9cc5eefc98',
    //   //   },
    //   // ]);
    //   expect(result).toEqual(groups[0]);
    // });

    it('should throw exception for invalid id', async () => {
      const input: UpdateGroupInput = {
        name: 'New1',
      };

      updateGroupByIdMock.mockResolvedValue(false);

      try {
        await groupService.updateGroup(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f9',
          input,
        );
      } catch (error) {
        expect(updateGroupByIdMock).toBeCalledWith(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f9',
          input,
        );
        expect(getGroupByIdMock).not.toBeCalled();

        expect(error).toBeInstanceOf(GroupNotFoundException);
      }
    });
  });

  // describe('deleteGroup', () => {
  //   it('should delete a group', async () => {
  //     // groupRepository
  //     //   .softDelete('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
  //     //   .resolves(Arg.any());
  //     // userRepository.createQueryBuilder().returns(userQueryBuilder);
  //     userQueryBuilder
  //       .innerJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId=User.id')
  //       .returns(userQueryBuilder);
  //     userQueryBuilder
  //       .where('userGroup.groupId = :id', {
  //         id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       })
  //       .returns(userQueryBuilder);
  //     userQueryBuilder.getCount().resolves(0);
  //     const result = await groupService.deleteGroup(
  //       'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //     );
  //     expect(result).toEqual(groups[0]);
  //   });
  // });

  // describe('updateGroupPermissions', () => {
  //   it('should add permissions to a group', async () => {
  //     const request = [
  //       {
  //         groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //         permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //       },
  //     ];
  //     const input: UpdateGroupPermissionInput = {
  //       permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
  //     };

  //     permissionRepository
  //       .findByIds(['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'])
  //       .resolves(permissions);

  //     groupPermissionRepository.create(request).returns(request);

  //     permissionRepository
  //       .createQueryBuilder('permission')
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .leftJoinAndSelect(
  //         GroupPermission,
  //         'groupPermission',
  //         'permission.id = groupPermission.permissionId',
  //       )
  //       .returns(permissionQueryBuilder);

  //     permissionQueryBuilder
  //       .where('groupPermission.groupId = :groupId', {
  //         groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       })
  //       .returns(permissionQueryBuilder);

  //     permissionQueryBuilder.getMany().resolves(permissions);

  //     // mockDataSource.manager.transaction(Arg.any()).resolves(request);

  //     const result = await groupService.updateGroupPermissions(
  //       'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       input,
  //     );
  //     expect(result).toEqual(permissions);
  //   });

  //   it('should throw exception when adding invalid permissions to a group', async () => {
  //     const input: UpdateGroupPermissionInput = {
  //       permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
  //     };

  //     permissionRepository
  //       .findByIds(['3e9e78c9-3fcd-4eed-b027-62f794680b03'])
  //       .resolves([]);

  //     const result = groupService.updateGroupPermissions(
  //       'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       input,
  //     );
  //     await expect(result).rejects.toThrowError(
  //       new PermissionNotFoundException(
  //         ['3e9e78c9-3fcd-4eed-b027-62f794680b03'].toString(),
  //       ),
  //     );
  //   });
  // });

  // describe('getGroupRoles', () => {
  //   it('should get group roles', async () => {
  //     const roles: Role[] = [
  //       {
  //         id: 'fcd858c6-26c5-462b-8c53-4b544830dca8',
  //         name: 'Role1',
  //       },
  //     ];
  //     roleRepository.createQueryBuilder('role').returns(roleQueryBuilder);
  //     roleQueryBuilder
  //       .leftJoinAndSelect(GroupRole, 'groupRole', 'role.id = groupRole.roleId')
  //       .returns(roleQueryBuilder);
  //     roleQueryBuilder
  //       .where('groupRole.groupId = :groupId', {
  //         groupId: '356c00da-7356-4b66-bc9c-901ad0ede230',
  //       })
  //       .returns(roleQueryBuilder);
  //     roleQueryBuilder.getMany().resolves(roles);
  //     const result = await groupService.getGroupRoles(
  //       '356c00da-7356-4b66-bc9c-901ad0ede230',
  //     );
  //     expect(result).toEqual(roles);
  //   });
  // });

  // describe('getGroupPermissions', () => {
  //   it('should get group permissions', async () => {
  //     const group: Group = {
  //       id: '09f7f119-c14b-4c37-ac1f-aae57d7bdbe5',
  //       name: 'Test1',
  //     };

  //     const permissions: Permission[] = [
  //       {
  //         id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //         name: 'Customers',
  //         label: 'Customers',
  //       },
  //     ];
  //     permissionRepository
  //       .createQueryBuilder('permission')
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .leftJoinAndSelect(
  //         GroupPermission,
  //         'groupPermission',
  //         'permission.id = groupPermission.permissionId',
  //       )
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .where('groupPermission.groupId = :groupId', {
  //         groupId: group.id,
  //       })
  //       .returns(permissionQueryBuilder);
  //     const result = await groupService.getGroupPermissions(group.id);
  //     expect(result).toEqual(permissions);
  //   });

  //   it('should get all group permissions', async () => {
  //     const group: Group = {
  //       id: '09f7f119-c14b-4c37-ac1f-aae57d7bdbe5',
  //       name: 'Test1',
  //     };
  //     const permissionsOfGroup: Permission[] = [
  //       {
  //         id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //         name: 'Customers',
  //         label: 'Customers',
  //       },
  //     ];
  //     const rolePermissionsOfGroup: Permission[] = [
  //       {
  //         id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //         name: 'Customers',
  //         label: 'Customers',
  //       },
  //     ];
  //     const result = await groupService.getGroupPermissions(group.id);
  //     expect(result).toEqual(permissionsOfGroup);
  //     permissionRepository
  //       .createQueryBuilder('permission')
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .innerJoin(
  //         RolePermission,
  //         'rolePermission',
  //         'permission.id = rolePermission.permissionId',
  //       )
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .innerJoin(
  //         GroupRole,
  //         'groupRole',
  //         'rolePermission.roleId = groupRole.roleId',
  //       )
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .where('groupRole.groupId = :groupId', {
  //         groupId: group.id,
  //       })
  //       .returns(permissionQueryBuilder);
  //     const allPermissionsOfGroup = permissionsOfGroup.concat(
  //       rolePermissionsOfGroup,
  //     );
  //     const permissionIds = allPermissionsOfGroup.map(
  //       (permission) => permission.id,
  //     );
  //     const filteredPermissions = allPermissionsOfGroup.filter(
  //       ({ id }, index) => !permissionIds.includes(id, index + 1),
  //     );
  //     const finalResponse = await groupService.getAllGroupPermissions(group.id);
  //     expect(finalResponse).toEqual(filteredPermissions);
  //   });
  // });
});
