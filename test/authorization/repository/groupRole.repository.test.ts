import { Test } from '@nestjs/testing';
import { GroupRoleRepository } from '../../../src/authorization/repository/groupRole.repository';
import { DataSource } from 'typeorm';
import Group from '../../../src/authorization/entity/group.entity';

describe('test GroupRole repository', () => {
  let groupRoleRepository: GroupRoleRepository;

  let createQueryBuilderMock: jest.Mock;
  let getCountMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  const VALID_ROLE_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupRoleRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    groupRoleRepository = moduleRef.get(GroupRoleRepository);

    createQueryBuilderMock = groupRoleRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: (getCountMock = jest.fn()),
      });
  });

  describe('getGroupCountForRoleId', () => {
    it('should get group role count by role id', async () => {
      getCountMock.mockResolvedValue(1);
      const result = await groupRoleRepository.getGroupCountForRoleId(
        VALID_ROLE_ID,
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual(
        'groupRole',
      );

      expect(
        createQueryBuilderMock().innerJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(Group);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'groupRole.roleId= :roleId',
      );

      expect(getCountMock).toBeCalledTimes(1);

      expect(result).toStrictEqual(1);
    });
  });
});
