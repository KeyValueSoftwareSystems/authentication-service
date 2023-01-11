import { Test } from '@nestjs/testing';
import Role from 'src/authorization/entity/role.entity';
import { UpdateRoleInput } from 'src/schema/graphql.schema';
import { DataSource, In, UpdateResult } from 'typeorm';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import { RoleRepository } from '../../../src/authorization/repository/role.repository';

const VALID_ROLE_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

const role: Role = {
  id: VALID_ROLE_ID,
  name: 'Test Role 1',
};

const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Role repository', () => {
  let roleRepository: RoleRepository;

  let findOneByMock: jest.Mock;
  let updateMock: jest.Mock;
  let findMock: jest.Mock;
  let createQueryBuilderMock: jest.Mock;
  let getManyMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    roleRepository = moduleRef.get(RoleRepository);

    findOneByMock = roleRepository.findOneBy = jest.fn();
    updateMock = roleRepository.update = jest.fn();
    findMock = roleRepository.find = jest.fn();

    createQueryBuilderMock = roleRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: (getManyMock = jest.fn()),
      });
  });

  describe('getRoleById', () => {
    it('should get role by role id', async () => {
      findOneByMock.mockResolvedValue(role);

      const result = await roleRepository.getRoleById(VALID_ROLE_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_ROLE_ID,
      });

      expect(result).toEqual(role);
    });
  });

  describe('updateRoleById', () => {
    it('should get true if role is successfully updated', async () => {
      const updateRoleInput: UpdateRoleInput = {
        name: 'New Role 1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = await roleRepository.updateRoleById(
        VALID_ROLE_ID,
        updateRoleInput,
      );

      expect(updateMock).toBeCalledWith(VALID_ROLE_ID, {
        name: 'New Role 1',
      });

      expect(result).toEqual(true);
    });
  });

  describe('getRolesByIds', () => {
    it('should get roles by role ids', async () => {
      findMock.mockResolvedValue([role]);

      const result = await roleRepository.getRolesByIds([VALID_ROLE_ID]);

      expect(findMock).toBeCalledWith({
        where: {
          id: In([VALID_ROLE_ID]),
        },
      });

      expect(result).toEqual([role]);
    });
  });

  describe('getRolesForGroupId', () => {
    it('should get all groups for group id', async () => {
      getManyMock.mockReturnValue([role]);

      const result = await roleRepository.getRolesForGroupId(
        '3282163d-fd5a-4026-b912-1a9cc5eefc98',
      );

      expect(createQueryBuilderMock.mock.calls[0][0]).toStrictEqual('role');

      expect(
        createQueryBuilderMock().leftJoinAndSelect.mock.calls[0][0],
      ).toStrictEqual(GroupRole);

      expect(createQueryBuilderMock().where.mock.calls[0][0]).toStrictEqual(
        'groupRole.groupId = :groupId',
      );

      expect(getManyMock).toBeCalledTimes(1);

      expect(result).toEqual([role]);
    });
  });
});
