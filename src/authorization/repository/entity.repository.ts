import { Injectable } from '@nestjs/common';
import { UpdateEntityInput } from 'src/schema/graphql.schema';
import { DataSource } from 'typeorm';
import EntityModel from '../entity/entity.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class EntityModelRepository extends BaseRepository<EntityModel> {
  constructor(private dataSource: DataSource) {
    super(EntityModel, dataSource);
  }

  async getAllEntities(): Promise<EntityModel[]> {
    return this.find();
  }

  async getEntityById(id: string) {
    return this.findOneBy({ id });
  }

  async updateEntityById(
    id: string,
    role: UpdateEntityInput,
  ): Promise<Boolean> {
    const updatedEntity = await this.update(id, role);
    return updatedEntity.affected !== 0;
  }
}
