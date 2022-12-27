import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Permission from '../entity/permission.entity';
import { BaseRepository } from './base.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource);
  }

  getAllPermissions() {
    return this.find();
  }

  getPermissionById(id: string) {
    return this.findOneBy({ id });
  }

  createPermission(newPermissionInput: NewPermissionInput) {
    return this.save(newPermissionInput);
  }

  async updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ) {
    const result = await this.update({ id }, updatePermissionInput);

    return result.affected === 1;
  }

  async deletePermission(id: string) {
    const result = await this.softDelete({ id });

    return result.affected === 1;
  }
}
