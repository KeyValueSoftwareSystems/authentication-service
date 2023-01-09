import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import EntityModel from '../entity/entity.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class EntityRepository extends BaseRepository<EntityModel> {
  constructor(private dataSource: DataSource) {
    super(EntityModel, dataSource);
  }

  async getAllEntities(): Promise<EntityModel[]> {
    return this.find();
  }

  async getEntityById(id: string) {
    return this.findOneBy({ id });
  }
}
