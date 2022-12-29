import { Test } from '@nestjs/testing';
import { UserPermissionRepository } from '../../../src/authorization/repository/userPermission.repository';
import { DataSource } from 'typeorm';

describe('test UserPermission repository', () => {
  let userPermissionRepository: UserPermissionRepository;
  const mockDataSource = { createEntityManager: jest.fn() };

  const VALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserPermissionRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userPermissionRepository = moduleRef.get<UserPermissionRepository>(
      UserPermissionRepository,
    );

    jest.spyOn(userPermissionRepository, 'count').mockResolvedValue(0);
  });

  it('should get UserPermision count by permissionId', () => {
    const result = userPermissionRepository.getUserPermissionCount(
      VALID_PERMISSION_ID,
    );

    expect(userPermissionRepository.count).toBeCalledWith({
      where: { permissionId: VALID_PERMISSION_ID },
    });
    expect(result).resolves.toEqual(0);
  });
});
