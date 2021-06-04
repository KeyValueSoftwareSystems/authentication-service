import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';
import { Repository } from 'typeorm';
import { PermissionNotFoundException } from '../exception/permission.exception';
import Permission from '../entity/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  getAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find({ where: { active: true } });
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne(id, {
      where: { active: true },
    });
    if (permission) {
      return permission;
    }
    throw new PermissionNotFoundException(id);
  }

  async createPermission(permission: NewPermissionInput): Promise<Permission> {
    const newPermission = await this.permissionsRepository.create(permission);
    const savedPermission = await this.permissionsRepository.save(
      newPermission,
    );
    return savedPermission;
  }

  async updatePermission(
    id: string,
    permission: UpdatePermissionInput,
  ): Promise<Permission> {
    const permissionToUpdate = this.permissionsRepository.create(permission);
    await this.permissionsRepository.update(id, permissionToUpdate);
    const updatedPermission = await this.permissionsRepository.findOne(id);
    if (updatedPermission) {
      return updatedPermission;
    }
    throw new PermissionNotFoundException(id);
  }

  async deletePermission(id: string): Promise<Permission> {
    await this.permissionsRepository.update(id, { active: false });
    const deletedPermission = await this.permissionsRepository.findOne(id);
    if (deletedPermission) {
      return deletedPermission;
    }
    throw new PermissionNotFoundException(id);
  }
}
