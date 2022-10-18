import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
  UpdateGroupUserInput,
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
import { UserNotFoundException } from '../exception/user.exception';
import UserCacheService from './usercache.service';
import User from '../entity/user.entity';

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private connection: Connection,
    private userCacheService: UserCacheService,
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

  async getGroupUsers(id: string): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId = user.id')
      .where('userGroup.groupId = :groupId', { groupId: id })
      .getMany();
    return users;
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
    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }
    const groupPermission = this.groupPermissionRepository.create(
      request.permissions.map((permission) => ({
        groupId: id,
        permissionId: permission,
      })),
    );
    const savedGroupPermissions = await this.groupPermissionRepository.save(
      groupPermission,
    );
    const permissions = await this.permissionRepository.findByIds(
      savedGroupPermissions.map((g) => g.permissionId),
    );
    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return permissions;
  }

  async getGroupPermissions(id: string): Promise<Permission[]> {
    const permissions = await createQueryBuilder<Permission>('permission')
      .leftJoinAndSelect(
        GroupPermission,
        'groupPermission',
        'Permission.id = groupPermission.permissionId',
      )
      .where('groupPermission.groupId = :groupId', { groupId: id })
      .getMany();
    return permissions;
  }

  async updateGroupUsers(
    id: string,
    input: UpdateGroupUserInput,
  ): Promise<User[]> {
    await this.getGroupById(id);
    const usersInRequest = await this.userRepository.findByIds(input.users);
    const existingUsersOfGroup = await this.getGroupUsers(id);

    const validUsersInRequest: Set<string> = new Set(
      usersInRequest.map((p) => p.id),
    );
    if (usersInRequest.length !== input.users.length) {
      throw new UserNotFoundException(
        input.users.filter((u) => !validUsersInRequest.has(u)).toString(),
      );
    }

    const usersToBeRemovedFromGroup: UserGroup[] = existingUsersOfGroup
      .filter((user) => !validUsersInRequest.has(user.id))
      .map((user) => ({ userId: user.id, groupId: id }));
    const userGroups = this.userGroupRepository.create(
      input.users.map((userId) => ({ userId: userId, groupId: id })),
    );

    await this.connection.manager.transaction(async (entityManager) => {
      const userGroupsRepo = entityManager.getRepository(UserGroup);
      await userGroupsRepo.remove(usersToBeRemovedFromGroup);
      await userGroupsRepo.save(userGroups);
    });

    const users = await this.getGroupUsers(id);
    for (const user of users) {
      await this.userCacheService.invalidateUserGroupsCache(user.id);
    }
    return users;
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
    const rolesInRequest = await this.rolesRepository.findByIds(request.roles);
    if (rolesInRequest.length !== request.roles.length) {
      const validRoles = rolesInRequest.map((r) => r.id);
      throw new RoleNotFoundException(
        request.roles.filter((r) => !validRoles.includes(r)).toString(),
      );
    }
    const groupRoles = this.groupRoleRepository.create(
      request.roles.map((role) => ({
        groupId: id,
        roleId: role,
      })),
    );
    const savedGroupRoles = await this.groupRoleRepository.save(groupRoles);
    const roles = await this.rolesRepository.findByIds(
      savedGroupRoles.map((groupRole) => groupRole.roleId),
    );
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
