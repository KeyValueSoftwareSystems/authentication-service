import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Permission from '../entity/permission.entity';
import { BaseRepository } from './base.repository';
import { GroupPermissionRepository } from './grouppermission.repository';
import { UserPermissionRepository } from './userpermission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';
import {
  PermissionDeleteNotAllowedException,
  PermissionNotFoundException,
} from '../exception/permission.exception';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    private dataSource: DataSource,
    private userPermissionRepository: UserPermissionRepository,
    private groupPermissionRepository: GroupPermissionRepository,
  ) {
    super(Permission, dataSource);
  }

  getAllPermissions(): Promise<Permission[]> {
    return this.find();
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.findOneBy({ id });

    if (permission) {
      return permission;
    }

    throw new PermissionNotFoundException(id);
  }

  async createPermission(
    newPermissionInput: NewPermissionInput,
  ): Promise<Permission> {
    return this.save(newPermissionInput);
  }

  async updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ) {
    const existingPermission = await this.getPermissionById(id);
    const updatedPermission = {
      ...existingPermission,
      ...updatePermissionInput,
    };

    return this.save(updatedPermission);
  }

  async deletePermission(id: string): Promise<Permission> {
    const existingPermission = await this.getPermissionById(id);

    if (await this.isPermissionBeingUsed(id)) {
      throw new PermissionDeleteNotAllowedException();
    }

    await this.softDelete({ id });

    return existingPermission;
  }

  async isPermissionBeingUsed(id: string) {
    const userPermissionCount = await this.userPermissionRepository.getUserPermissionCount(
      id,
    );
    const groupPermissionCount = await this.groupPermissionRepository.getGroupPermissionCount(
      id,
    );
    const totalCount = userPermissionCount + groupPermissionCount;

    return totalCount != 0;
  }
}
