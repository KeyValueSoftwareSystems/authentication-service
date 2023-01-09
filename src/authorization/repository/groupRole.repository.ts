import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Group from '../entity/group.entity';
import GroupRole from '../entity/groupRole.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class GroupRoleRepository extends BaseRepository<GroupRole> {
  constructor(private dataSource: DataSource) {
    super(GroupRole, dataSource);
  }

  async getGroupCountForRoleId(roleId: string) {
    return this.createQueryBuilder('groupRole')
      .innerJoinAndSelect(Group, 'group', 'group.id = groupRole.groupId')
      .where('groupRole.roleId= :roleId', { roleId })
      .getCount();
  }
}
