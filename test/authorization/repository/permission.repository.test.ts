import { Test } from '@nestjs/testing';
import { DataSource, UpdateResult } from 'typeorm';
import Permission from '../../../src/authorization/entity/permission.entity';
import { PermissionRepository } from '../../../src/authorization/repository/permission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';

const permissions: Permission[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
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
  const dataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    permissionRepository = moduleRef.get<PermissionRepository>(
      PermissionRepository,
    );

    jest.spyOn(permissionRepository, 'save').mockResolvedValue(permissions[0]);
    jest.spyOn(permissionRepository, 'update').mockResolvedValue(updateResult);
    jest.spyOn(permissionRepository, 'find').mockResolvedValue(permissions);
    jest
      .spyOn(permissionRepository, 'findOneBy')
      .mockResolvedValue(permissions[0]);
    jest
      .spyOn(permissionRepository, 'softDelete')
      .mockResolvedValue(updateResult);
  });

  it('should get all the permissions', () => {
    const result = permissionRepository.getAllPermissions();

    expect(result).resolves.toEqual(permissions);
  });

  it('should get a permission by id', () => {
    const result = permissionRepository.getPermissionById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should create a permission', () => {
    const input: NewPermissionInput = {
      name: 'Test1',
    };

    const result = permissionRepository.createPermission(input);

    expect(result).resolves.toEqual(permissions[0]);
  });

  it('should update a permission', () => {
    const input: UpdatePermissionInput = {
      name: 'Test1',
    };

    const result = permissionRepository.updatePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );

    expect(result).resolves.toEqual(true);
  });

  it('should delete a permission', () => {
    const result = permissionRepository.deletePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );

    expect(result).resolves.toEqual(true);
  });
});
