import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import Group from '../entity/group.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class GroupRepository extends BaseRepository<Group> {
  constructor(private dataSource: DataSource) {
    super(Group, dataSource);
  }

  async getGroupById(id: string) {
    return this.findOneBy({ id });
  }

  async findByIds(ids: string[]) {
    return this.find({
      where: {
        id: In(ids),
      },
    });
  }
}
