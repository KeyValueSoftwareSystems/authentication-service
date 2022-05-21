import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import { createQueryBuilder, Repository } from 'typeorm';
import Role from '../entity/role.entity';
import RolePermission from '../entity/rolePermission.entity';
import Permission from '../entity/permission.entity';
import {
  RoleNotFoundException,
  RoleDeleteNotAllowedException,
} from '../exception/role.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import RoleCacheService from './rolecache.service';
import GroupRole from '../entity/groupRole.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private roleCacheService: RoleCacheService,
  ) {}

  async getAllRoles(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return role;
  }

  async createRole(role: NewRoleInput): Promise<Role> {
    const newRole = this.rolesRepository.create(role);
    await this.rolesRepository.insert(newRole);
    return newRole;
  }

  async updateRole(id: string, role: UpdateRoleInput): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne(id);
    if (!existingRole) {
      throw new RoleNotFoundException(id);
    }
    const roleToUpdate = this.rolesRepository.create(role);
    await this.rolesRepository.update(id, roleToUpdate);
    return {
      ...existingRole,
      ...roleToUpdate,
    };
  }

  async deleteRole(id: string): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne(id);
    if (!existingRole) {
      throw new RoleNotFoundException(id);
    }
    const usage = await this.checkRoleUsage(id);
    if (usage) {
      throw new RoleDeleteNotAllowedException(id);
    }
    await this.rolesRepository.softDelete(id);
    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return existingRole;
  }

  async updateRolePermissions(
    id: string,
    request: UpdateRolePermissionInput,
  ): Promise<Permission[]> {
    const updatedRole = await this.rolesRepository.findOne(id);
    if (!updatedRole) {
      throw new RoleNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.findByIds(
      request.permissions,
    );
    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }
    const rolePermissions = this.rolePermissionRepository.create(
      request.permissions.map((permission) => ({
        roleId: id,
        permissionId: permission,
      })),
    );
    const savedRolePermissions = await this.rolePermissionRepository.save(
      rolePermissions,
    );
    const permissions = await this.permissionRepository.findByIds(
      savedRolePermissions.map((r) => r.permissionId),
    );
    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return permissions;
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    const permissions = await createQueryBuilder<Permission>('permission')
      .leftJoinAndSelect(
        RolePermission,
        'rolePermission',
        'Permission.id = rolePermission.permissionId',
      )
      .where('rolePermission.roleId = :roleId', { roleId: id })
      .getMany();
    return permissions;
  }

  private async checkRoleUsage(id: string) {
    const groupCount = await this.groupRoleRepository.count({
      where: { roleId: id },
    });
    return groupCount != 0;
  }
}
