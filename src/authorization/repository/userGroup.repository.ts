import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import UserGroup from '../entity/userGroup.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserGroupRepository extends BaseRepository<UserGroup> {
  constructor(private dataSource: DataSource) {
    super(UserGroup, dataSource);
  }

  async getUserGroupsByUserId(userId: string): Promise<UserGroup[]> {
    return this.find({ where: { userId } });
  }
}
