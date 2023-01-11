import { Test } from '@nestjs/testing';
import GroupPermission from 'src/authorization/entity/groupPermission.entity';
import { DataSource } from 'typeorm';
import { GroupPermissionRepository } from '../../../src/authorization/repository/groupPermission.repository';

const VALID_PERMISSION_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';
const VALID_GROUP_ID = '3282163d-fd5a-4026-b912-1a9cc5eefc98';

const groupPermissions: GroupPermission[] = [
  {
    groupId: VALID_GROUP_ID,
    permissionId: VALID_PERMISSION_ID,
  },
];

describe('test GroupPermission repository', () => {
  let groupPermissionRepository: GroupPermissionRepository;

  let countMock: jest.Mock;
  let findMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

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

    groupPermissionRepository = moduleRef.get(GroupPermissionRepository);

    countMock = groupPermissionRepository.count = jest.fn();
    findMock = groupPermissionRepository.find = jest.fn();
  });

  describe('getGroupPermissionCount', () => {
    it('should get group permision count by permission id', async () => {
      countMock.mockResolvedValue(0);

      const result = await groupPermissionRepository.getGroupPermissionCount(
        VALID_PERMISSION_ID,
      );

      expect(countMock).toBeCalledWith({
        where: { permissionId: VALID_PERMISSION_ID },
      });

      expect(result).toEqual(0);
    });
  });

  describe('getGroupPermissionsForGroupId', () => {
    it('should get group permisions by group id', async () => {
      findMock.mockResolvedValue(groupPermissions);

      const result = await groupPermissionRepository.getGroupPermissionsForGroupId(
        VALID_GROUP_ID,
      );

      expect(findMock).toBeCalledWith({
        where: { groupId: VALID_GROUP_ID },
      });

      expect(result).toEqual(groupPermissions);
    });
  });
});
