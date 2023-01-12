import { Test } from '@nestjs/testing';
import User from 'src/authorization/entity/user.entity';
import { DataSource, In, UpdateResult } from 'typeorm';
import UserGroup from '../../../src/authorization/entity/userGroup.entity';
import { UserRepository } from '../../../src/authorization/repository/user.repository';
import { Status, UpdateUserInput } from '../../../src/schema/graphql.schema';

const VALID_USER_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';
const VALID_EMAIL = 'test@valid.com';
const VALID_PHONE = '9876543210';

const users: User[] = [
  {
    id: VALID_USER_ID,
    firstName: 'Test ',
    lastName: 'User 1',
    origin: 'simple',
    status: Status.ACTIVE,
    email: VALID_EMAIL,
  },
];

const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test User repository', () => {
  let userRepository: UserRepository;

  let findOneByMock: jest.Mock;
  let createQueryBuilderMock: jest.Mock;
  let getOneMock: jest.Mock;
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;
  let findMock: jest.Mock;
  let getManyMock: jest.Mock;
  let getCountMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userRepository = moduleRef.get(UserRepository);

    findOneByMock = userRepository.findOneBy = jest.fn();
    findOneMock = userRepository.findOne = jest.fn();
    updateMock = userRepository.update = jest.fn();
    findMock = userRepository.find = jest.fn();

    createQueryBuilderMock = userRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: (getOneMock = jest.fn()),
        getMany: (getManyMock = jest.fn()),
        getCount: (getCountMock = jest.fn()),
      });
  });

  describe('getUserById', () => {
    it('should get user by user id', async () => {
      findOneByMock.mockResolvedValue(users[0]);

      const result = await userRepository.getUserById(VALID_USER_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_USER_ID,
      });

      expect(result).toEqual(users[0]);
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      getOneMock.mockResolvedValue(users[0]);

      const result = await userRepository.getUserByEmail(VALID_EMAIL);

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('user');

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'lower(user.email) = lower(:email)',
      );

      expect(getOneMock).toBeCalledTimes(1);

      expect(result).toEqual(users[0]);
    });
  });

  describe('getUserByPhone', () => {
    it('should get user by phone', async () => {
      findOneMock.mockResolvedValue(users[0]);

      const result = await userRepository.getUserByPhone(VALID_PHONE);

      expect(findOneMock).toBeCalledWith({ where: { phone: VALID_PHONE } });

      expect(result).toEqual(users[0]);
    });
  });

  describe('updateUserById', () => {
    it('should get true if user is successfully updated', async () => {
      const updateUserInput: UpdateUserInput = {
        firstName: 'New',
        lastName: 'User 1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = await userRepository.updateUserById(
        VALID_USER_ID,
        updateUserInput,
      );

      expect(updateMock).toBeCalledWith(VALID_USER_ID, {
        firstName: 'New',
        lastName: 'User 1',
      });

      expect(result).toEqual(true);
    });
  });

  describe('getUsersByIds', () => {
    it('should get users by user ids', async () => {
      findMock.mockResolvedValue(users);

      const result = await userRepository.getUsersByIds([VALID_USER_ID]);

      expect(findMock).toBeCalledWith({
        where: {
          id: In([VALID_USER_ID]),
        },
      });

      expect(result).toEqual(users);
    });
  });

  describe('getUsersByGroupId', () => {
    it('should get all users for group id', async () => {
      getManyMock.mockReturnValue(users);

      const result = await userRepository.getUsersByGroupId(
        '3282163d-fd5a-4026-b912-1a9cc5eefc98',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('user');

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(UserGroup);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'userGroup.groupId = :groupId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual(users);
    });
  });

  describe('getUserCountForGroupId', () => {
    it('should get all groups for group id', async () => {
      getCountMock.mockReturnValue(1);

      const result = await userRepository.getUserCountForGroupId(
        '3282163d-fd5a-4026-b912-1a9cc5eefc98',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('user');

      expect(
        createQueryBuilderMock().innerJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(UserGroup);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'userGroup.groupId = :groupId',
      );

      expect(getCountMock).toBeCalledTimes(1);

      expect(result).toEqual(1);
    });
  });
});
