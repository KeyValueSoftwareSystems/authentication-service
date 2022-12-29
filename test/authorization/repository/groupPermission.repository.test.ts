import { Test } from '@nestjs/testing';
import { GroupPermissionRepository } from '../../../src/authorization/repository/groupPermission.repository';
import { DataSource } from 'typeorm';

describe('test GroupPermission repository', () => {
  let groupPermissionRepository: GroupPermissionRepository;
  const mockDataSource = { createEntityManager: jest.fn() };

  const VALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupPermissionRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    groupPermissionRepository = moduleRef.get<GroupPermissionRepository>(
      GroupPermissionRepository,
    );

    jest.spyOn(groupPermissionRepository, 'count').mockResolvedValue(0);
  });

  it('should get GroupPermision count by permissionId', () => {
    const result = groupPermissionRepository.getGroupPermissionCount(
      VALID_PERMISSION_ID,
    );

    expect(groupPermissionRepository.count).toBeCalledWith({
      where: { permissionId: VALID_PERMISSION_ID },
    });
    expect(result).resolves.toEqual(0);
  });
});
