import { Injectable } from '@nestjs/common';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from 'src/schema/graphql.schema';
import { DataSource, In } from 'typeorm';
import EntityPermission from '../entity/entityPermission.entity';
import GroupPermission from '../entity/groupPermission.entity';
import GroupRole from '../entity/groupRole.entity';
import Permission from '../entity/permission.entity';
import RolePermission from '../entity/rolePermission.entity';
import UserPermission from '../entity/userPermission.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource);
  }

  async getAllPermissions() {
    return this.find();
  }

  async getPermissionById(id: string) {
    return this.findOneBy({ id });
  }

  async createPermission(newPermissionInput: NewPermissionInput) {
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

  async getPermissionsByIds(ids: string[]) {
    return this.find({ where: { id: In(ids) } });
  }

  async getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    return this.createQueryBuilder('permission')
      .leftJoinAndSelect(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .where('rolePermission.roleId = :roleId', { roleId })
      .getMany();
  }

  async getPermissionsByGroupId(groupId: string): Promise<Permission[]> {
    return this.createQueryBuilder('permission')
      .leftJoinAndSelect(
        GroupPermission,
        'groupPermission',
        'permission.id = groupPermission.permissionId',
      )
      .where('groupPermission.groupId = :groupId', { groupId })
      .getMany();
  }

  async getPermissionsByEntityId(entityId: string): Promise<Permission[]> {
    return this.createQueryBuilder('permission')
      .leftJoinAndSelect(
        EntityPermission,
        'entityPermission',
        'permission.id = cast(entityPermission.permissionId as uuid)',
      )
      .where('entityPermission.entityId = :entityId', {
        entityId,
      })
      .getMany();
  }

  async getPermissionsByUserId(userId: string): Promise<Permission[]> {
    return this.createQueryBuilder('permission')
      .leftJoinAndSelect(
        UserPermission,
        'userPermission',
        'permission.id = userPermission.permissionId',
      )
      .where('userPermission.userId = :userId', { userId })
      .getMany();
  }

  async getGroupRolePermissionsByGroupId(
    groupId: string,
  ): Promise<Permission[]> {
    return this.createQueryBuilder('permission')
      .innerJoin(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .innerJoin(
        GroupRole,
        'groupRole',
        'rolePermission.roleId = groupRole.roleId',
      )
      .where('groupRole.groupId = :groupId', { groupId })
      .getMany();
  }
}
