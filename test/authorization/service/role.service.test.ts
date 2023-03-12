import { Test } from '@nestjs/testing';
import Role from 'src/authorization/entity/role.entity';
import RolePermission from 'src/authorization/entity/rolePermission.entity';
import { DataSource, UpdateResult } from 'typeorm';
import Permission from '../../../src/authorization/entity/permission.entity';
import { PermissionNotFoundException } from '../../../src/authorization/exception/permission.exception';
import { RoleNotFoundException } from '../../../src/authorization/exception/role.exception';
import { GroupRoleRepository } from '../../../src/authorization/repository/groupRole.repository';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import { RoleRepository } from '../../../src/authorization/repository/role.repository';
import { RolePermissionRepository } from '../../../src/authorization/repository/rolePermission.repository';
import { RoleService } from '../../../src/authorization/service/role.service';
import { RoleCacheServiceInterface } from '../../../src/authorization/service/rolecache.service.interface';
import SearchService from '../../../src/authorization/service/search.service';
import {
  NewRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionInput,
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
const rolePermissions: RolePermission[] = [
  {
    roleId: VALID_ROLE_ID,
    permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
  },
];
const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Role Service', () => {
  let roleService: RoleService;
  let createQueryBuilderMock: jest.Mock;
  let getManyAndCountMock: jest.Mock;
  let saveMock: jest.Mock;
  let getRoleByIdMock: jest.Mock;
  let updateRoleByIdMock: jest.Mock;
  let getGroupCountForRoleIdMock: jest.Mock;
  let roleSoftDeleteMock: jest.Mock;
  let rolePermissionSoftDeleteMock: jest.Mock;
  let getPermissionsByIdsMock: jest.Mock;
  let getPermissionsByRoleIdMock: jest.Mock;

  let withRepositoryMock: jest.Mock;
  let entityManager: any;

  const roleRepository: RoleRepository = ({
    getRoleById: (getRoleByIdMock = jest.fn()),
    save: (saveMock = jest.fn()),
    updateRoleById: (updateRoleByIdMock = jest.fn()),
    softDelete: (roleSoftDeleteMock = jest.fn()),
  } as unknown) as RoleRepository;
  const permissionRepository: PermissionRepository = ({
    getPermissionsByIds: (getPermissionsByIdsMock = jest.fn()),
    getPermissionsByRoleId: (getPermissionsByRoleIdMock = jest.fn()),
  } as unknown) as PermissionRepository;
  const groupRoleRepository: GroupRoleRepository = ({
    getGroupCountForRoleId: (getGroupCountForRoleIdMock = jest.fn()),
    softDelete: jest.fn(),
  } as unknown) as GroupRoleRepository;
  const rolePermissionRepository: RolePermissionRepository = ({
    create: jest.fn(),
    softDelete: (rolePermissionSoftDeleteMock = jest.fn()),
  } as unknown) as RolePermissionRepository;
  const roleCacheService: RoleCacheServiceInterface = ({} as unknown) as RoleCacheServiceInterface;
  const searchService: SearchService = ({} as unknown) as SearchService;

  const repositoryMap = new Map<any, any>([
    [RoleRepository, roleRepository],
    [RolePermissionRepository, rolePermissionRepository],
  ]);

  withRepositoryMock = jest
    .fn()
    .mockImplementation((type) => repositoryMap.get(type));

  entityManager = { withRepository: withRepositoryMock };

  const mockDataSource = {
    createEntityManager: jest.fn(),
    transaction: jest.fn(),
    manager: {
      transaction: jest.fn().mockImplementation((cb) => {
        return cb(entityManager);
      }),
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    roleService = new RoleService(
      roleCacheService,
      roleRepository,
      groupRoleRepository,
      rolePermissionRepository,
      permissionRepository,
      moduleRef.get(DataSource),
      searchService,
    );

    createQueryBuilderMock = roleRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: (getManyAndCountMock = jest.fn()),
      });
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
      getRoleByIdMock.mockResolvedValue(roles[0]);

      const result = await roleService.getRoleById(VALID_ROLE_ID);

      expect(getRoleByIdMock).toBeCalledWith(VALID_ROLE_ID);

      expect(result).toEqual(roles[0]);
    });

    it('should throw exception for invalid id', async () => {
      getRoleByIdMock.mockResolvedValue(null);

      try {
        await roleService.getRoleById(INVALID_ROLE_ID);
      } catch (error) {
        expect(getRoleByIdMock).toBeCalledWith(INVALID_ROLE_ID);

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

      updateRoleByIdMock.mockResolvedValue(updateResult);
      getRoleByIdMock.mockResolvedValue(roles[0]);

      const result = await roleService.updateRole(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        input,
      );

      expect(updateRoleByIdMock).toBeCalledWith(VALID_ROLE_ID, input);
      expect(getRoleByIdMock).toBeCalledWith(VALID_ROLE_ID);

      expect(result).toEqual({
        id: VALID_ROLE_ID,
        name: 'Test1',
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      getRoleByIdMock.mockResolvedValue(roles[0]);
      getGroupCountForRoleIdMock.mockResolvedValue(0);

      withRepositoryMock.mockResolvedValue(rolePermissionRepository);
      rolePermissionSoftDeleteMock.mockResolvedValue(updateResult);
      withRepositoryMock.mockResolvedValue(roleRepository);
      roleSoftDeleteMock.mockResolvedValue(updateResult);

      const result = await roleService.deleteRole(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      );

      expect(getRoleByIdMock).toBeCalledWith(VALID_ROLE_ID);
      expect(getGroupCountForRoleIdMock).toBeCalledWith(VALID_ROLE_ID);
      expect(roleSoftDeleteMock).toBeCalled();
      expect(result).toEqual(roles[0]);
    });
  });

  describe('updateRolePermissions', () => {
    it('should add permissions to a role', async () => {
      const request = [
        {
          roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
          permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
        },
      ];

      const input: UpdateRolePermissionInput = {
        permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
      };

      getRoleByIdMock.mockResolvedValue(roles[0]);
      getPermissionsByIdsMock.mockResolvedValue(permissions);
      getPermissionsByRoleIdMock.mockResolvedValue(permissions);

      const result = await roleService.updateRolePermissions(
        'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        input,
      );

      expect(getRoleByIdMock).toBeCalledWith(VALID_ROLE_ID);
      expect(getPermissionsByIdsMock).toBeCalledWith([
        '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
      ]);
      expect(getPermissionsByRoleIdMock).toBeCalledWith(VALID_ROLE_ID);

      expect(result).toEqual(permissions);
    });

    it('should throw exception when adding invalid permissions to a role', async () => {
      const input: UpdateRolePermissionInput = {
        permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
      };

      getRoleByIdMock.mockResolvedValue(roles[0]);
      getPermissionsByIdsMock.mockResolvedValue([
        '3e9e78c9-3fcd-4eed-b027-62f794680b03',
        'b7bcebbd-c260-4517-acea-745c8e6db3ec',
      ]);

      try {
        await roleService.updateRolePermissions(
          'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
          input,
        );
      } catch (error) {
        expect(getRoleByIdMock).toBeCalledWith(VALID_ROLE_ID);
        expect(getPermissionsByIdsMock).toBeCalledWith([
          '3e9e78c9-3fcd-4eed-b027-62f794680b03',
        ]);

        expect(error).toBeInstanceOf(PermissionNotFoundException);
        expect(error.message).toEqual(
          'Permission 3e9e78c9-3fcd-4eed-b027-62f794680b03 not found',
        );
      }
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions of the role', async () => {
      const permissions: Permission[] = [
        {
          id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
          name: 'Customers',
          label: 'Customers',
        },
      ];

      getPermissionsByRoleIdMock.mockResolvedValue(permissions);

      const result = await roleService.getRolePermissions(
        'fcd858c6-26c5-462b-8c53-4b544830dca8',
      );

      expect(getPermissionsByRoleIdMock).toBeCalledWith(
        'fcd858c6-26c5-462b-8c53-4b544830dca8',
      );

      expect(result).toEqual(permissions);
    });
  });
});
