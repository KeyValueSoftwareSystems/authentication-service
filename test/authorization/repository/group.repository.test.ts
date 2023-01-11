import { Test } from '@nestjs/testing';
import Group from 'src/authorization/entity/group.entity';
import { UpdateGroupInput } from 'src/schema/graphql.schema';
import * as typeorm from 'typeorm';
import { DataSource, UpdateResult } from 'typeorm';
import UserGroup from '../../../src/authorization/entity/userGroup.entity';
import { GroupRepository } from '../../../src/authorization/repository/group.repository';

const VALID_GROUP_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

const group: Group = {
  id: VALID_GROUP_ID,
  name: 'Test Group 1',
};

const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Group repository', () => {
  let groupRepository: GroupRepository;

  let findOneByMock: jest.Mock;
  let updateMock: jest.Mock;
  let findMock: jest.Mock;
  let createQueryBuilderMock: jest.Mock;
  let getManyMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GroupRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    groupRepository = moduleRef.get(GroupRepository);

    findOneByMock = groupRepository.findOneBy = jest.fn();
    updateMock = groupRepository.update = jest.fn();
    findMock = groupRepository.find = jest.fn();

    createQueryBuilderMock = groupRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: (getManyMock = jest.fn()),
      });
  });

  describe('getGroupById', () => {
    it('should get group by group id', async () => {
      findOneByMock.mockResolvedValue(group);

      const result = await groupRepository.getGroupById(VALID_GROUP_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_GROUP_ID,
      });

      expect(result).toEqual(group);
    });
  });

  describe('updateGroupById', () => {
    it('should get true if role is successfully updated', async () => {
      const updateGroupInput: UpdateGroupInput = {
        name: 'New Group 1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = await groupRepository.updateGroupById(
        VALID_GROUP_ID,
        updateGroupInput,
      );

      expect(updateMock).toBeCalledWith(VALID_GROUP_ID, {
        name: 'New Group 1',
      });

      expect(result).toEqual(true);
    });
  });

  describe('getGroupsByIds', () => {
    it('should get groups by group ids', async () => {
      findMock.mockResolvedValue([group]);

      const result = await groupRepository.getGroupsByIds([VALID_GROUP_ID]);

      expect(findMock).toBeCalledWith({
        where: {
          id: typeorm.In([VALID_GROUP_ID]),
        },
      });

      expect(result).toEqual([group]);
    });
  });

  describe('getGroupsForUserId', () => {
    it('should get groups for the specified user', async () => {
      getManyMock.mockReturnValue([group]);

      const result = await groupRepository.getGroupsForUserId(
        '7c4f773a-0ad7-45db-ac56-65390f3e7dfa',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('group');

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(UserGroup);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'userGroup.userId = :userId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual([group]);
    });
  });
});
