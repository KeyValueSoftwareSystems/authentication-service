import { Substitute } from '@fluffy-spoon/substitute';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import Role from 'src/authorization/entity/role.entity';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Permission from '../../../src/authorization/entity/permission.entity';
import RolePermission from '../../../src/authorization/entity/rolePermission.entity';
import { RoleNotFoundException } from '../../../src/authorization/exception/role.exception';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import { RoleRepository } from '../../../src/authorization/repository/role.repository';
import { RoleService } from '../../../src/authorization/service/role.service';
import { RoleCacheServiceInterface } from '../../../src/authorization/service/rolecache.service.interface';
import SearchService from '../../../src/authorization/service/search.service';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';
import {
  NewRoleInput,
  UpdateRoleInput,
} from '../../../src/schema/graphql.schema';

const VALID_ROLE_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';
const INVALID_ROLE_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f9';
const roles: Role[] = [
  {
    id: VALID_ROLE_ID,
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
const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Role Service', () => {
  let roleService: RoleService;
  let roleRepository: RoleRepository;
  let permissionRepository: PermissionRepository;
  const groupRoleRepository = Substitute.for<Repository<GroupRole>>();
  const rolePermissionRepository = Substitute.for<Repository<RolePermission>>();
  const roleCacheService = Substitute.for<RoleCacheServiceInterface>();
  const redisCacheService = Substitute.for<RedisCacheService>();
  const searchService = Substitute.for<SearchService>();
  const groupRoleQueryBuilder = Substitute.for<SelectQueryBuilder<GroupRole>>();
  const permissionQueryBuilder = Substitute.for<
    SelectQueryBuilder<Permission>
  >();

  let createQueryBuilderMock: jest.Mock;
  let getManyAndCountMock: jest.Mock;
  let findOneByMock: jest.Mock;
  let saveMock: jest.Mock;
  let updateMock: jest.Mock;
  let getManyMock: jest.Mock;

  const mockDataSource = {
    createEntityManager: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RoleService,
        ConfigService,
        AuthenticationHelper,
        RoleRepository,
        PermissionRepository,
        {
          provide: getRepositoryToken(GroupRole),
          useValue: groupRoleRepository,
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: rolePermissionRepository,
        },
        { provide: RoleCacheServiceInterface, useValue: roleCacheService },
        { provide: RedisCacheService, useValue: redisCacheService },
        { provide: SearchService, useValue: searchService },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    roleService = moduleRef.get(RoleService);
    roleRepository = moduleRef.get(RoleRepository);
    permissionRepository = moduleRef.get(PermissionRepository);

    createQueryBuilderMock = roleRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: (getManyAndCountMock = jest.fn()),
      });

    findOneByMock = roleRepository.findOneBy = jest.fn();
    saveMock = roleRepository.save = jest.fn();
    updateMock = roleRepository.update = jest.fn();
  });

  describe('getAllRoles', () => {
    it('should get all roles when no parameters are passed', async () => {
      getManyAndCountMock.mockReturnValue([roles, 1]);

      const result = await roleService.getAllRoles();

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('role');

      expect(createQueryBuilderMock().where).not.toBeCalled();

      expect(getManyAndCountMock).toBeCalledTimes(1);

      expect(result).toEqual([roles, 1]);
    });
  });

  describe('getRoleById', () => {
    it('should get a role for valid id', async () => {
      findOneByMock.mockResolvedValue(roles[0]);

      const result = await roleService.getRoleById(VALID_ROLE_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_ROLE_ID,
      });

      expect(result).toEqual(roles[0]);
    });

    it('should throw exception for invalid id', async () => {
      let result;
      findOneByMock.mockResolvedValue(null);

      try {
        result = await roleService.getRoleById(INVALID_ROLE_ID);
      } catch (error) {
        expect(findOneByMock).toBeCalledWith({
          id: INVALID_ROLE_ID,
        });

        expect(error).toBeInstanceOf(RoleNotFoundException);
      }
    });
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      const input: NewRoleInput = {
        name: 'Test1',
      };

      saveMock.mockResolvedValue(roles[0]);

      const result = await roleService.createRole(input);

      expect(saveMock).toBeCalledWith(input);

      expect(result).toEqual(roles[0]);
    });
  });

  describe('updateRole', () => {
    it('should update a role for a valid role id', async () => {
      const input: UpdateRoleInput = {
        name: 'Test1',
      };

      updateMock.mockResolvedValue(updateResult);
      findOneByMock.mockResolvedValue(roles[0]);

      const result = await roleService.updateRole(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        input,
      );

      expect(updateMock).toBeCalledWith(VALID_ROLE_ID, input);
      expect(findOneByMock).toBeCalledWith({
        id: VALID_ROLE_ID,
      });

      expect(result).toEqual({
        id: VALID_ROLE_ID,
        name: 'Test1',
      });
    });
  });

  // describe('deleteRole', () => {
  //   it('should delete a role', async () => {
  //     // roleRepository
  //     //   .softDelete('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
  //     //   .resolves(Arg.any());
  //     groupRoleRepository.createQueryBuilder().returns(groupRoleQueryBuilder);
  //     groupRoleQueryBuilder
  //       .innerJoinAndSelect(Group, 'group', 'group.id = GroupRole.groupId')
  //       .returns(groupRoleQueryBuilder);
  //     groupRoleQueryBuilder
  //       .where('GroupRole.roleId= :id', {
  //         id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       })
  //       .returns(groupRoleQueryBuilder);
  //     groupRoleQueryBuilder.getCount().resolves(0);
  //     const resp = await roleService.deleteRole(
  //       'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //     );
  //     expect(resp).toEqual(roles[0]);
  //   });
  // });

  // describe('updateRolePermissions', () => {
  //   it('should add permissions to a role', async () => {
  //     const request = [
  //       {
  //         roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //         permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //       },
  //     ];
  //     const input: UpdateRolePermissionInput = {
  //       permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
  //     };

  //     // permissionRepository
  //     //   .findByIds(['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'])
  //     //   .resolves(permissions);

  //     // rolePermissionRepository.create(request).returns(request);

  //     // permissionRepository
  //     //   .createQueryBuilder('permission')
  //     //   .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .leftJoinAndSelect(
  //         RolePermission,
  //         'rolePermission',
  //         'permission.id = rolePermission.permissionId',
  //       )
  //       .returns(permissionQueryBuilder);

  //     permissionQueryBuilder
  //       .where('rolePermission.roleId = :roleId', {
  //         roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       })
  //       .returns(permissionQueryBuilder);

  //     permissionQueryBuilder.getMany().resolves(permissions);

  //     mockDataSource.transaction(Arg.any()).resolves(request);

  //     const result = await roleService.updateRolePermissions(
  //       'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
  //       input,
  //     );
  //     expect(result).toEqual(permissions);
  //   });

  //   it('should throw exception when adding invalid permissions to a role', async () => {
  //     const input: UpdateRolePermissionInput = {
  //       permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
  //     };

  //     // permissionRepository
  //     //   .findByIds(['3e9e78c9-3fcd-4eed-b027-62f794680b03'])
  //     //   .resolves([]);

  //     const result = roleService.updateRolePermissions(
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

  // describe('getRolePermissions', () => {
  //   it('should return all permissions of the role', async () => {
  //     const permissions: Permission[] = [
  //       {
  //         id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  //         name: 'Customers',
  //         label: 'Customers',
  //       },
  //     ];
  //     // permissionRepository
  //     //   .createQueryBuilder('permission')
  //     //   .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .leftJoinAndSelect(
  //         RolePermission,
  //         'rolePermission',
  //         'permission.id = rolePermission.permissionId',
  //       )
  //       .returns(permissionQueryBuilder);
  //     permissionQueryBuilder
  //       .where('rolePermission.roleId = :roleId', {
  //         roleId: 'fcd858c6-26c5-462b-8c53-4b544830dca8',
  //       })
  //       .returns(permissionQueryBuilder);
  //     const result = await roleService.getRolePermissions(
  //       'fcd858c6-26c5-462b-8c53-4b544830dca8',
  //     );
  //     expect(result).toEqual(permissions);
  //   });
  // });
});
