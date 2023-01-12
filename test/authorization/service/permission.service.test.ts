import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import Permission from '../../../src/authorization/entity/permission.entity';
import {
  PermissionDeleteNotAllowedException,
  PermissionNotFoundException,
} from '../../../src/authorization/exception/permission.exception';
import { GroupPermissionRepository } from '../../../src/authorization/repository/groupPermission.repository';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import { UserPermissionRepository } from '../../../src/authorization/repository/userPermission.repository';
import { PermissionService } from '../../../src/authorization/service/permission.service';
import PermissionCacheService from '../../../src/authorization/service/permissioncache.service';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';

const VALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';
const INVALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f9';
const PERMISSION_ID_IN_USAGE = '0d88ef27-dd26-4a01-bfef-4d703bcdb05d';
const permissions: Permission[] = [
  {
    id: VALID_PERMISSION_ID,
    name: 'Test1',
    label: 'Test 1',
  },
];

describe('test Permission service', () => {
  let permissionService: PermissionService;
  let permissionRepository: PermissionRepository;
  let userPermissionRepository: UserPermissionRepository;
  let groupPermissionRepository: GroupPermissionRepository;

  let getAllPermissionsMock: jest.Mock;
  let getPermissionByIdMock: jest.Mock;
  let createPermissionMock: jest.Mock;
  let updatePermissionMock: jest.Mock;
  let deletePermissionMock: jest.Mock;
  let getUserPermissionCountMock: jest.Mock;
  let getGroupPermissionCountMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };
  const mockPermissionCacheService = { invalidatePermissionsCache: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionService,
        PermissionRepository,
        UserPermissionRepository,
        GroupPermissionRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: PermissionCacheService,
          useValue: mockPermissionCacheService,
        },
      ],
    }).compile();

    permissionService = moduleRef.get(PermissionService);
    permissionRepository = moduleRef.get(PermissionRepository);
    userPermissionRepository = moduleRef.get(UserPermissionRepository);
    groupPermissionRepository = moduleRef.get(GroupPermissionRepository);

    getAllPermissionsMock = permissionRepository.getAllPermissions = jest.fn();
    getPermissionByIdMock = permissionRepository.getPermissionById = jest.fn();
    createPermissionMock = permissionRepository.createPermission = jest.fn();
    updatePermissionMock = permissionRepository.updatePermission = jest.fn();
    deletePermissionMock = permissionRepository.deletePermission = jest.fn();
    getUserPermissionCountMock = userPermissionRepository.getUserPermissionCount = jest.fn();
    getGroupPermissionCountMock = groupPermissionRepository.getGroupPermissionCount = jest.fn();
  });

  describe('getAllPermissions', () => {
    it('should get all permissions', async () => {
      getAllPermissionsMock.mockResolvedValue(permissions);

      const result = await permissionService.getAllPermissions();

      expect(getAllPermissionsMock).toBeCalled();

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionById', () => {
    it('should get a permission by id', async () => {
      getPermissionByIdMock.mockResolvedValue(permissions[0]);

      const result = await permissionService.getPermissionById(
        VALID_PERMISSION_ID,
      );

      expect(getPermissionByIdMock).toBeCalledWith(VALID_PERMISSION_ID);

      expect(result).toEqual(permissions[0]);
    });

    it('should throw exception when getting a permission with invalid id', async () => {
      getPermissionByIdMock.mockResolvedValue(null);

      try {
        await permissionService.getPermissionById(INVALID_PERMISSION_ID);
      } catch (error) {
        expect(getPermissionByIdMock).toBeCalledWith(INVALID_PERMISSION_ID);

        expect(error).toBeInstanceOf(PermissionNotFoundException);
      }
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const input: NewPermissionInput = {
        name: 'Test1',
      };

      createPermissionMock.mockResolvedValue(permissions[0]);

      const result = await permissionService.createPermission(input);

      expect(createPermissionMock).toBeCalledWith(input);

      expect(result).toEqual(permissions[0]);
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      const input: UpdatePermissionInput = {
        name: 'Test1',
      };

      updatePermissionMock.mockResolvedValue(true);
      getPermissionByIdMock.mockResolvedValue(permissions[0]);

      const result = await permissionService.updatePermission(
        VALID_PERMISSION_ID,
        input,
      );

      expect(updatePermissionMock).toBeCalledWith(VALID_PERMISSION_ID, input);
      expect(getPermissionByIdMock).toBeCalledWith(VALID_PERMISSION_ID);

      expect(result).toEqual(permissions[0]);
    });

    it('should throw exception when updating a permission with invalid id', async () => {
      const input: UpdatePermissionInput = {
        name: 'Test1',
      };

      updatePermissionMock.mockResolvedValue(false);

      try {
        await permissionService.updatePermission(INVALID_PERMISSION_ID, input);
      } catch (error) {
        expect(getPermissionByIdMock).not.toBeCalled();

        expect(error).toBeInstanceOf(PermissionNotFoundException);
      }
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      getPermissionByIdMock.mockResolvedValue(permissions[0]);
      getUserPermissionCountMock.mockResolvedValue(0);
      getGroupPermissionCountMock.mockResolvedValue(0);
      deletePermissionMock.mockResolvedValue(true);

      const result = await permissionService.deletePermission(
        VALID_PERMISSION_ID,
      );

      expect(getPermissionByIdMock).toBeCalledWith(VALID_PERMISSION_ID);
      expect(getUserPermissionCountMock).toBeCalledWith(VALID_PERMISSION_ID);
      expect(getGroupPermissionCountMock).toBeCalledWith(VALID_PERMISSION_ID);
      expect(deletePermissionMock).toBeCalledWith(VALID_PERMISSION_ID);

      expect(result).toEqual(permissions[0]);
    });

    it('should throw exception when deleting a permission with invalid id', async () => {
      getPermissionByIdMock.mockResolvedValue(null);

      try {
        await permissionService.deletePermission(INVALID_PERMISSION_ID);
      } catch (error) {
        expect(getPermissionByIdMock).toBeCalledWith(INVALID_PERMISSION_ID);
        expect(getUserPermissionCountMock).not.toBeCalled();
        expect(getGroupPermissionCountMock).not.toBeCalled();
        expect(deletePermissionMock).not.toBeCalled();

        expect(error).toBeInstanceOf(PermissionNotFoundException);
      }
    });

    it('should throw exception when deleting a permission in usage', async () => {
      getPermissionByIdMock.mockResolvedValue(permissions[0]);
      getUserPermissionCountMock.mockResolvedValue(1);
      getGroupPermissionCountMock.mockResolvedValue(1);

      try {
        await permissionService.deletePermission(PERMISSION_ID_IN_USAGE);
      } catch (error) {
        expect(getPermissionByIdMock).toBeCalledWith(PERMISSION_ID_IN_USAGE);
        expect(getUserPermissionCountMock).toBeCalledWith(
          PERMISSION_ID_IN_USAGE,
        );
        expect(getGroupPermissionCountMock).toBeCalledWith(
          PERMISSION_ID_IN_USAGE,
        );
        expect(deletePermissionMock).not.toBeCalled();

        expect(error).toBeInstanceOf(PermissionDeleteNotAllowedException);
      }
    });
  });
});
