import { Test } from '@nestjs/testing';
import { Entity, UpdateEntityInput } from 'src/schema/graphql.schema';
import { DataSource, UpdateResult } from 'typeorm';
import { EntityModelRepository } from '../../../src/authorization/repository/entity.repository';

const VALID_ENTITY_ID = 'ae032b1b-cc3c-4e44-9197-276ca877a7f8';

const entity: Entity = {
  id: VALID_ENTITY_ID,
  name: 'Test Entity 1',
};

const updateResult: UpdateResult = {
  raw: '',
  affected: 1,
  generatedMaps: [],
};

describe('test Entity model repository', () => {
  let entityRepository: EntityModelRepository;

  let findMock: jest.Mock;
  let findOneByMock: jest.Mock;
  let updateMock: jest.Mock;

  const mockDataSource = { createEntityManager: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EntityModelRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    entityRepository = moduleRef.get(EntityModelRepository);

    findOneByMock = entityRepository.findOneBy = jest.fn();
    updateMock = entityRepository.update = jest.fn();
    findMock = entityRepository.find = jest.fn();
  });

  describe('getAllEntities', () => {
    it('should get all the permissions', async () => {
      findMock.mockResolvedValue([entity]);

      const result = await entityRepository.getAllEntities();

      expect(findMock).toBeCalled();

      expect(result).toEqual([entity]);
    });
  });

  describe('getEntityById', () => {
    it('should get entity by entity id', async () => {
      findOneByMock.mockResolvedValue(entity);

      const result = await entityRepository.getEntityById(VALID_ENTITY_ID);

      expect(findOneByMock).toBeCalledWith({
        id: VALID_ENTITY_ID,
      });

      expect(result).toEqual(entity);
    });
  });

  describe('updateEntityById', () => {
    it('should get true if role is successfully updated', async () => {
      const updateEntityInput: UpdateEntityInput = {
        name: 'New Entity 1',
      };

      updateMock.mockResolvedValue(updateResult);

      const result = await entityRepository.updateEntityById(
        VALID_ENTITY_ID,
        updateEntityInput,
      );

      expect(updateMock).toBeCalledWith(VALID_ENTITY_ID, {
        name: 'New Entity 1',
      });

      expect(result).toEqual(true);
    });
  });
});
