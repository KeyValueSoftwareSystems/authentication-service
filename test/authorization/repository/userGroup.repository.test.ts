import { Test } from '@nestjs/testing';
import UserGroup from 'src/authorization/entity/userGroup.entity';
import { DataSource } from 'typeorm';
import { UserGroupRepository } from '../../../src/authorization/repository/userGroup.repository';

const VALID_USER_ID = 'ccecef4f-58d3-477b-87ee-847ee22efe4d';
const VALID_GROUP_ID = '3282163d-fd5a-4026-b912-1a9cc5eefc98';

const userGroups: UserGroup[] = [
  {
    userId: VALID_USER_ID,
    groupId: VALID_GROUP_ID,
  },
];

describe('test UserGroup repository', () => {
  let userGroupRepository: UserGroupRepository;

  let findMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserGroupRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userGroupRepository = moduleRef.get(UserGroupRepository);

    findMock = userGroupRepository.find = jest.fn();
  });

  describe('getUserGroupsByUserId', () => {
    it('should get user groups by user id', async () => {
      findMock.mockResolvedValue(userGroups);

      const result = await userGroupRepository.getUserGroupsByUserId(
        'ccecef4f-58d3-477b-87ee-847ee22efe4d',
      );

      expect(findMock).toBeCalledWith({
        where: { userId: 'ccecef4f-58d3-477b-87ee-847ee22efe4d' },
      });

      expect(result).toEqual(userGroups);
    });
  });
});
