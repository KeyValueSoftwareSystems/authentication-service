import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import RolePermission from '../entity/rolePermission.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor(private dataSource: DataSource) {
    super(RolePermission, dataSource);
  }

  async findByRoleId(roleId: string) {
    return this.find({ where: { roleId } });
  }
}
