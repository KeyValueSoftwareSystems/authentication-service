import { Test } from '@nestjs/testing';
import { DataSource, In, UpdateResult } from 'typeorm';
import EntityPermission from '../../../src/authorization/entity/entityPermission.entity';
import GroupPermission from '../../../src/authorization/entity/groupPermission.entity';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Permission from '../../../src/authorization/entity/permission.entity';
import RolePermission from '../../../src/authorization/entity/rolePermission.entity';
import UserPermission from '../../../src/authorization/entity/userPermission.entity';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';

const VALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

const permissions: Permission[] = [
  {
    id: VALID_PERMISSION_ID,
    name: 'Test1',
    label: 'Test 1',
  },
];

const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Permission repository', () => {
  let permissionRepository: PermissionRepository;

  let findMock: jest.Mock;
  let findOneByMock: jest.Mock;
  let saveMock: jest.Mock;
  let updateMock: jest.Mock;
  let softDeleteMock: jest.Mock;
  let createQueryBuilderMock: jest.Mock;
  let getManyMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    permissionRepository = moduleRef.get(PermissionRepository);

    findMock = permissionRepository.find = jest.fn();
    findOneByMock = permissionRepository.findOneBy = jest.fn();
    saveMock = permissionRepository.save = jest.fn();
    updateMock = permissionRepository.update = jest.fn();
    softDeleteMock = permissionRepository.softDelete = jest.fn();

    createQueryBuilderMock = permissionRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: (getManyMock = jest.fn()),
      });
  });

  describe('getAllPermissions', () => {
    it('should get all the permissions', async () => {
      findMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getAllPermissions();

      expect(findMock).toBeCalled();

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionById', () => {
    it('should get a permission by id', async () => {
      findOneByMock.mockResolvedValue(permissions[0]);

      const result = await permissionRepository.getPermissionById(
        VALID_PERMISSION_ID,
      );

      expect(findOneByMock).toBeCalledWith({
        id: VALID_PERMISSION_ID,
      });

      expect(result).toEqual(permissions[0]);
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const input: NewPermissionInput = {
        name: 'Test1',
      };

      saveMock.mockResolvedValue(permissions[0]);

      const result = await permissionRepository.createPermission(input);

      expect(saveMock).toBeCalledWith(input);

      expect(result).toEqual(permissions[0]);
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      const input: UpdatePermissionInput = {
        name: 'Test1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = await permissionRepository.updatePermission(
        VALID_PERMISSION_ID,
        input,
      );

      expect(updateMock).toBeCalledWith({ id: VALID_PERMISSION_ID }, input);

      expect(result).toEqual(true);
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      softDeleteMock.mockResolvedValue(updateResult);

      const result = await permissionRepository.deletePermission(
        VALID_PERMISSION_ID,
      );

      expect(softDeleteMock).toBeCalledWith({
        id: VALID_PERMISSION_ID,
      });

      expect(result).toEqual(true);
    });
  });

  describe('getPermissionsByIds', () => {
    it('should get all the permissions by permission ids', async () => {
      findMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getPermissionsByIds([
        VALID_PERMISSION_ID,
      ]);

      expect(findMock).toBeCalledWith({
        where: { id: In([VALID_PERMISSION_ID]) },
      });

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionsByRoleId', () => {
    it('should get all the permissions by role id', async () => {
      getManyMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getPermissionsByRoleId(
        '7c4f773a-0ad7-45db-ac56-65390f3e7dfa',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'permission',
      );

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(RolePermission);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'rolePermission.roleId = :roleId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionsByGroupId', () => {
    it('should get all the permissions by group id', async () => {
      getManyMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getPermissionsByGroupId(
        '3282163d-fd5a-4026-b912-1a9cc5eefc98',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'permission',
      );

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(GroupPermission);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'groupPermission.groupId = :groupId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionsByEntityId', () => {
    it('should get all the permissions by entity id', async () => {
      getManyMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getPermissionsByEntityId(
        '4192ac95-d60d-41f5-89b3-f87c1a58d63e',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'permission',
      );

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(EntityPermission);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'entityPermission.entityId = :entityId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(permissions);
    });
  });

  describe('getPermissionsByUserId', () => {
    it('should get all the permissions by user id', async () => {
      getManyMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getPermissionsByUserId(
        'ccecef4f-58d3-477b-87ee-847ee22efe4d',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'permission',
      );

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(UserPermission);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'userPermission.userId = :userId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(permissions);
    });
  });

  describe('getGroupRolePermissionsByGroupId', () => {
    it('should get all the group and role permissions by group id', async () => {
      getManyMock.mockResolvedValue(permissions);

      const result = await permissionRepository.getGroupRolePermissionsByGroupId(
        'ccecef4f-58d3-477b-87ee-847ee22efe4d',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'permission',
      );

      expect(createQueryBuilderMock().innerJoin.mock.calls[0][0]).toStrictEqual(
        RolePermission,
      );

      expect(createQueryBuilderMock().innerJoin.mock.calls[1][0]).toStrictEqual(
        GroupRole,
      );

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'groupRole.groupId = :groupId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(permissions);
    });
  });
});
