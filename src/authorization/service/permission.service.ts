import { Inject, Injectable } from '@nestjs/common';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../schema/graphql.schema';
import Permission from '../entity/permission.entity';
import {
  PermissionDeleteNotAllowedException,
  PermissionNotFoundException,
} from '../exception/permission.exception';
import { GroupPermissionRepository } from '../repository/groupPermission.repository';
import { PermissionRepository } from '../repository/permission.repository';
import { UserPermissionRepository } from '../repository/userPermission.repository';
import { PermissionServiceInterface } from './permission.service.interface';
import { PermissionCacheServiceInterface } from './permissioncache.service.interface';

@Injectable()
export class PermissionService implements PermissionServiceInterface {
  constructor(
    private permissionRepository: PermissionRepository,
    private userPermissionRepository: UserPermissionRepository,
    private groupPermissionRepository: GroupPermissionRepository,
    @Inject(PermissionCacheServiceInterface)
    private permissionCacheService: PermissionCacheServiceInterface,
  ) {}

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.getAllPermissions();
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.getPermissionById(id);

    if (permission) {
      return permission;
    }

    throw new PermissionNotFoundException(id);
  }

  async createPermission(
    newPermissionInput: NewPermissionInput,
  ): Promise<Permission> {
    return this.permissionRepository.createPermission(newPermissionInput);
  }

  async updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission> {
    const updateSucceeded = await this.permissionRepository.updatePermission(
      id,
      updatePermissionInput,
    );

    if (updateSucceeded) {
      return this.getPermissionById(id);
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

  private async isPermissionBeingUsed(id: string): Promise<boolean> {
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
