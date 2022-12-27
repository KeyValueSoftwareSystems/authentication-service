import { Injectable } from '@nestjs/common';
import Permission from '../entity/permission.entity';
import PermissionCacheService from './permissioncache.service';
import { PermissionRepository } from '../repository/permission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../schema/graphql.schema';
import { UserPermissionRepository } from '../repository/userpermission.repository';
import { GroupPermissionRepository } from '../repository/grouppermission.repository';
import {
  PermissionDeleteNotAllowedException,
  PermissionNotFoundException,
} from '../exception/permission.exception';

@Injectable()
export class PermissionService {
  constructor(
    private permissionRepository: PermissionRepository,
    private userPermissionRepository: UserPermissionRepository,
    private groupPermissionRepository: GroupPermissionRepository,
    private permissionCacheService: PermissionCacheService,
  ) {}

  getAllPermissions() {
    return this.permissionRepository.getAllPermissions();
  }

  async getPermissionById(id: string) {
    const permission = await this.permissionRepository.getPermissionById(id);

    if (permission) {
      return permission;
    }

    throw new PermissionNotFoundException(id);
  }

  createPermission(newPermissionInput: NewPermissionInput) {
    return this.permissionRepository.createPermission(newPermissionInput);
  }

  async updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ) {
    const updateSucceeded = await this.permissionRepository.updatePermission(
      id,
      updatePermissionInput,
    );

    if (updateSucceeded) {
      return await this.getPermissionById(id);
    }

    throw new PermissionNotFoundException(id);
  }

  async deletePermission(id: string): Promise<Permission> {
    const permissionToDelete = await this.getPermissionById(id);
    const isPermissionBeingUsed = await this.isPermissionBeingUsed(id);

    if (isPermissionBeingUsed) {
      throw new PermissionDeleteNotAllowedException();
    }

    await this.permissionRepository.deletePermission(id);
    await this.permissionCacheService.invalidatePermissionsCache(
      permissionToDelete.name,
    );

    return permissionToDelete;
  }

  async isPermissionBeingUsed(id: string) {
    const userPermissionCount = await this.userPermissionRepository.getUserPermissionCount(
      id,
    );
    const groupPermissionCount = await this.groupPermissionRepository.getGroupPermissionCount(
      id,
    );
    const totalCount = userPermissionCount + groupPermissionCount;

    return totalCount !== 0;
  }
}
