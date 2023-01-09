import { Test } from '@nestjs/testing';
import { RoleRepository } from '../../../src/authorization/repository/role.repository';
import { DataSource, UpdateResult } from 'typeorm';
import Role from 'src/authorization/entity/role.entity';
import { UpdateRoleInput } from 'src/schema/graphql.schema';

describe('test Role repository', () => {
  let roleRepository: RoleRepository;

  let findOneByMock: jest.Mock;
  let updateMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

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
  });

  describe('getRoleById', () => {
    it('should get role by role id', () => {
      findOneByMock.mockResolvedValue(role);

      const result = roleRepository.getRoleById(VALID_ROLE_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_ROLE_ID,
      });

      expect(result).resolves.toEqual(role);
    });
  });

  describe('updateRoleById', () => {
    it('should get true if role is successfully updated', () => {
      const updateRoleInput: UpdateRoleInput = {
        name: 'New Role 1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = roleRepository.updateRoleById(
        VALID_ROLE_ID,
        updateRoleInput,
      );

      expect(updateMock).toBeCalledWith(VALID_ROLE_ID, {
        name: 'New Role 1',
      });

      expect(result).resolves.toEqual(true);
    });
  });
});
