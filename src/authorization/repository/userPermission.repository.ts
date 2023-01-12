import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import UserPermission from '../entity/userPermission.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserPermissionRepository extends BaseRepository<UserPermission> {
  constructor(private dataSource: DataSource) {
    super(UserPermission, dataSource);
  }

  async getUserPermissionCount(permissionId: string): Promise<number> {
    return this.count({ where: { permissionId } });
  }

  async getUserPermissionsByUserId(userId: string): Promise<UserPermission[]> {
    return this.find({ where: { userId } });
  }
}
