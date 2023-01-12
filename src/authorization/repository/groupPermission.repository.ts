import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import GroupPermission from '../entity/groupPermission.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class GroupPermissionRepository extends BaseRepository<GroupPermission> {
  constructor(private dataSource: DataSource) {
    super(GroupPermission, dataSource);
  }

  async getGroupPermissionCount(permissionId: string): Promise<number> {
    return this.count({ where: { permissionId } });
  }

  async getGroupPermissionsForGroupId(
    groupId: string,
  ): Promise<GroupPermission[]> {
    return this.find({
      where: { groupId },
    });
  }
}
