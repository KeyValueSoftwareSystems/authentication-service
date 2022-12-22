import { Injectable } from '@nestjs/common';
import Permission from '../entity/permission.entity';
import PermissionCacheService from './permissioncache.service';
import { PermissionRepository } from '../repository/permission.repository';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../schema/graphql.schema';

@Injectable()
export class PermissionService {
  constructor(
    private permissionRepository: PermissionRepository,
    private permissionCacheService: PermissionCacheService,
  ) {}

  getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.getAllPermissions();
  }

  getPermissionById(id: string): Promise<Permission> {
    return this.permissionRepository.getPermissionById(id);
  }

  createPermission(
    newPermissionInput: NewPermissionInput,
  ): Promise<Permission> {
    return this.permissionRepository.createPermission(newPermissionInput);
  }

  updatePermission(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission> {
    return this.permissionRepository.updatePermission(
      id,
      updatePermissionInput,
    );
  }

  async deletePermission(id: string): Promise<Permission> {
    const deletedPermission = await this.permissionRepository.deletePermission(
      id,
    );

    await this.permissionCacheService.invalidatePermissionsCache(
      deletedPermission.name,
    );

    return deletedPermission;
  }
}
