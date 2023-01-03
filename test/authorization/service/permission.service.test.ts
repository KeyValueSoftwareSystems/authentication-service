import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PermissionService } from '../../../src/authorization/service/permission.service';
import Permission from '../../../src/authorization/entity/permission.entity';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import { UserPermissionRepository } from '../../../src/authorization/repository/userPermission.repository';
import { GroupPermissionRepository } from '../../../src/authorization/repository/groupPermission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';
import {
  PermissionDeleteNotAllowedException,
  PermissionNotFoundException,
} from '../../../src/authorization/exception/permission.exception';
import { PermissionServiceInterface } from '../../../src/authorization/service/permission.service.interface';
import { PermissionCacheServiceInterface } from '../../../src/authorization/service/permissioncache.service.interface';

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
  let permissionService: PermissionServiceInterface;
  let permissionRepository: PermissionRepository;
  let userPermissionRepository: UserPermissionRepository;
  let groupPermissionRepository: GroupPermissionRepository;

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
          provide: PermissionCacheServiceInterface,
          useValue: mockPermissionCacheService,
        },
      ],
    }).compile();

    permissionService = moduleRef.get<PermissionServiceInterface>(
      PermissionService,
    );
    permissionRepository = moduleRef.get<PermissionRepository>(
      PermissionRepository,
    );
    userPermissionRepository = moduleRef.get<UserPermissionRepository>(
      UserPermissionRepository,
    );
    groupPermissionRepository = moduleRef.get<GroupPermissionRepository>(
      GroupPermissionRepository,
    );

    jest
      .spyOn(permissionRepository, 'getAllPermissions')
      .mockResolvedValue(permissions);
    jest
      .spyOn(permissionRepository, 'createPermission')
      .mockResolvedValue(permissions[0]);
    jest
      .spyOn(permissionRepository, 'getPermissionById')
      .mockImplementation((id: string) =>
        Promise.resolve(
          id === VALID_PERMISSION_ID || id === PERMISSION_ID_IN_USAGE
            ? permissions[0]
            : null,
        ),
      );
    jest
      .spyOn(permissionRepository, 'updatePermission')
      .mockImplementation((id: string) =>
        Promise.resolve(id === VALID_PERMISSION_ID),
      );
    jest
      .spyOn(userPermissionRepository, 'getUserPermissionCount')
      .mockImplementation((permissionId: string) =>
        Promise.resolve(permissionId === VALID_PERMISSION_ID ? 0 : 1),
      );
    jest
      .spyOn(groupPermissionRepository, 'getGroupPermissionCount')
      .mockImplementation((permissionId: string) =>
        Promise.resolve(permissionId === VALID_PERMISSION_ID ? 0 : 1),
      );
    jest
      .spyOn(permissionRepository, 'deletePermission')
      .mockImplementation((id: string) =>
        Promise.resolve(id === VALID_PERMISSION_ID),
      );
  });

  it('should get all permissions', () => {
    const result = permissionService.getAllPermissions();

    expect(result).resolves.toEqual(permissions);
  });

  it('should get a permission by id', () => {
    const result = permissionService.getPermissionById(VALID_PERMISSION_ID);

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should throw when getting a permission with invalid id', () => {
    const result = permissionService.getPermissionById(INVALID_PERMISSION_ID);

    expect(result).rejects.toThrow(PermissionNotFoundException);
  });

  it('should create a permission', () => {
    const input: NewPermissionInput = {
      name: 'Test1',
    };

    const result = permissionService.createPermission(input);

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should update a permission', () => {
    const input: UpdatePermissionInput = {
      name: 'Test1',
    };

    const result = permissionService.updatePermission(
      VALID_PERMISSION_ID,
      input,
    );

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should throw when updating a permission with invalid id', () => {
    const input: UpdatePermissionInput = {
      name: 'Test1',
    };

    const result = permissionService.updatePermission(
      INVALID_PERMISSION_ID,
      input,
    );

    expect(result).rejects.toThrow(PermissionNotFoundException);
  });

  it('should delete a permission', () => {
    const result = permissionService.deletePermission(VALID_PERMISSION_ID);

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should throw when deleting a permission with invalid id', () => {
    const result = permissionService.deletePermission(INVALID_PERMISSION_ID);

    expect(result).rejects.toThrow(PermissionNotFoundException);
  });

  it('should throw when deleting a permission in usage', async () => {
    const result = permissionService.deletePermission(PERMISSION_ID_IN_USAGE);

    await expect(result).rejects.toThrow(PermissionDeleteNotAllowedException);
  });
});
