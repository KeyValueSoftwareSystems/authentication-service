import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import EntityPermission from '../entity/entityPermission.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class EntityPermissionRepository extends BaseRepository<EntityPermission> {
  constructor(private dataSource: DataSource) {
    super(EntityPermission, dataSource);
  }
}
