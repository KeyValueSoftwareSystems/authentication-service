import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
} from '../../schema/graphql.schema';
import { Connection, createQueryBuilder, Repository } from 'typeorm';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import Permission from '../entity/permission.entity';
import UserGroup from '../entity/userGroup.entity';
import {
  GroupNotFoundException,
  GroupDeleteNotAllowedException,
} from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import GroupCacheService from './groupcache.service';
import GroupRole from '../entity/groupRole.entity';
import Role from '../entity/role.entity';
import { RoleNotFoundException } from '../exception/role.exception';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private groupCacheService: GroupCacheService,
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private connection: Connection,
  ) {}

  getAllGroups(): Promise<Group[]> {
    return this.groupsRepository.find();
  }

  async getGroupById(id: string): Promise<Group> {
    const group = await this.groupsRepository.findOne(id);
    if (group) {
      return group;
    }
    throw new GroupNotFoundException(id);
  }

  async createGroup(group: NewGroupInput): Promise<Group> {
    const newGroup = await this.groupsRepository.create(group);
    await this.groupsRepository.insert(newGroup);
    return newGroup;
  }

  async updateGroup(id: string, group: UpdateGroupInput): Promise<Group> {
    const existingGroup = await this.groupsRepository.findOne(id);
    if (!existingGroup) {
      throw new GroupNotFoundException(id);
    }
    const groupToUpdate = this.groupsRepository.create(group);
    await this.groupsRepository.update(id, groupToUpdate);
    return {
      ...existingGroup,
      ...groupToUpdate,
    };
  }

  async deleteGroup(id: string): Promise<Group> {
    const existingGroup = await this.groupsRepository.findOne(id);
    if (!existingGroup) {
      throw new GroupNotFoundException(id);
    }
    const usage = await this.checkGroupUsage(id);
    if (usage) {
      throw new GroupDeleteNotAllowedException(id);
    }
    await this.groupsRepository.softDelete(id);
    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return existingGroup;
  }

  async updateGroupPermissions(
    id: string,
    request: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    const updatedGroup = await this.groupsRepository.findOne(id);
    if (!updatedGroup) {
      throw new GroupNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.findByIds(
      request.permissions,
    );
    const existingPermissionsOfGroup = await this.getGroupPermissions(id);
    const validPermissionsInRequest: Set<string> = new Set(
      permissionsInRequest.map((p) => p.id),
    );

    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }

    const permissionsToBeRemovedFromGroup: GroupPermission[] = existingPermissionsOfGroup
      .filter((p) => !validPermissionsInRequest.has(p.id))
      .map((p) => ({ permissionId: p.id, groupId: id }));

    const groupPermission = this.groupPermissionRepository.create(
      request.permissions.map((permission) => ({
        groupId: id,
        permissionId: permission,
      })),
    );

    await this.connection.manager.transaction(async (entityManager) => {
      const groupPermissionsRepo = entityManager.getRepository(GroupPermission);
      await groupPermissionsRepo.remove(permissionsToBeRemovedFromGroup);
      await groupPermissionsRepo.save(groupPermission);
    });

    const permissions = await this.getGroupPermissions(id);
    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return permissions;
  }

  async getGroupPermissions(id: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect(
        GroupPermission,
        'groupPermission',
        'permission.id = groupPermission.permissionId',
      )
      .where('groupPermission.groupId = :groupId', { groupId: id })
      .getMany();
    return permissions;
  }

  async getGroupRoles(id: string): Promise<Role[]> {
    const roles = await createQueryBuilder<Role>('role')
      .leftJoinAndSelect(GroupRole, 'groupRole', 'Role.id = groupRole.roleId')
      .where('groupRole.groupId = :groupId', { groupId: id })
      .getMany();
    return roles;
  }

  async updateGroupRoles(
    id: string,
    request: UpdateGroupRoleInput,
  ): Promise<Role[]> {
    const updatedGroup = await this.groupsRepository.findOne(id);
    if (!updatedGroup) {
      throw new GroupNotFoundException(id);
    }

    const existingRolesOfGroup = await this.getGroupRoles(id);
    const rolesInRequest = await this.rolesRepository.findByIds(request.roles);
    const validRolesInRequest: Set<string> = new Set(
      rolesInRequest.map((p) => p.id),
    );

    if (rolesInRequest.length !== request.roles.length) {
      const validRoles = rolesInRequest.map((r) => r.id);
      throw new RoleNotFoundException(
        request.roles.filter((r) => !validRoles.includes(r)).toString(),
      );
    }

    const rolesToBeRemovedFromGroup: GroupRole[] = existingRolesOfGroup
      .filter((p) => !validRolesInRequest.has(p.id))
      .map((r) => ({ groupId: id, roleId: r.id }));

    const groupRoles = this.groupRoleRepository.create(
      request.roles.map((role) => ({
        groupId: id,
        roleId: role,
      })),
    );

    await this.connection.manager.transaction(async (entityManager) => {
      const groupRolesRepo = entityManager.getRepository(GroupRole);
      await groupRolesRepo.remove(rolesToBeRemovedFromGroup);
      await groupRolesRepo.save(groupRoles);
    });

    const roles = await this.getGroupRoles(id);
    await this.groupCacheService.invalidateGroupRolesByGroupId(id);
    return roles;
  }

  private async checkGroupUsage(id: string) {
    const userCount = await this.userGroupRepository.count({
      where: { groupId: id },
    });
    return userCount != 0;
  }
}
