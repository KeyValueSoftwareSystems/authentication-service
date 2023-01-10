import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SearchEntity } from '../../constants/search.entity.enum';
import {
  GroupInputFilter,
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
} from '../../schema/graphql.schema';
import Group from '../entity/group.entity';
import GroupPermission from '../entity/groupPermission.entity';
import GroupRole from '../entity/groupRole.entity';
import Permission from '../entity/permission.entity';
import Role from '../entity/role.entity';
import User from '../entity/user.entity';
import UserGroup from '../entity/userGroup.entity';
import {
  GroupDeleteNotAllowedException,
  GroupNotFoundException,
} from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import { RoleNotFoundException } from '../exception/role.exception';
import { UserNotFoundException } from '../exception/user.exception';
import { GroupRepository } from '../repository/group.repository';
import { GroupPermissionRepository } from '../repository/groupPermission.repository';
import { GroupRoleRepository } from '../repository/groupRole.repository';
import { PermissionRepository } from '../repository/permission.repository';
import { RoleRepository } from '../repository/role.repository';
import { UserRepository } from '../repository/user.repository';
import { UserGroupRepository } from '../repository/userGroup.repository';
import GroupCacheService from './groupcache.service';
import SearchService from './search.service';
import UserCacheService from './usercache.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: GroupRepository,
    @InjectRepository(UserGroup)
    private userGroupRepository: UserGroupRepository,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: GroupPermissionRepository,
    @InjectRepository(Permission)
    private permissionRepository: PermissionRepository,
    private groupCacheService: GroupCacheService,
    @InjectRepository(GroupRole)
    private groupRoleRepository: GroupRoleRepository,
    @InjectRepository(Role)
    private rolesRepository: RoleRepository,
    @InjectRepository(User)
    private userRepository: UserRepository,
    private dataSource: DataSource,
    private userCacheService: UserCacheService,
    private searchService: SearchService,
  ) {}

  async getAllGroups(input?: GroupInputFilter): Promise<[Group[], number]> {
    const SortFieldMapping = new Map([['name', 'Group.name']]);
    let queryBuilder = this.groupRepository.createQueryBuilder();

    if (input?.search) {
      queryBuilder = this.searchService.generateSearchTermForEntity(
        queryBuilder,
        SearchEntity.GROUP,
        input.search,
      );
    }
    if (input?.sort) {
      const field = SortFieldMapping.get(input.sort.field);
      field && queryBuilder.orderBy(field, input.sort.direction);
    }
    if (input?.pagination) {
      queryBuilder
        .limit(input?.pagination?.limit ?? 10)
        .offset(input?.pagination?.offset ?? 0);
    }
    return queryBuilder.getManyAndCount();
  }

  async getGroupById(id: string): Promise<Group> {
    const group = await this.groupRepository.getGroupById(id);
    if (!group) {
      throw new GroupNotFoundException(id);
    }
    return group;
  }

  async createGroup(group: NewGroupInput): Promise<Group> {
    return this.groupRepository.save(group);
  }

  async updateGroup(id: string, group: UpdateGroupInput): Promise<Group> {
    const existingGroup = await this.groupRepository.getGroupById(id);
    if (!existingGroup) {
      throw new GroupNotFoundException(id);
    }
    if (group.users) {
      await this.updateGroupUsers(id, group.users);
    }
    await this.groupRepository.updateGroupById(id, group);
    return {
      ...existingGroup,
      ...group,
    };
  }

  async deleteGroup(id: string): Promise<Group> {
    const existingGroup = await this.groupRepository.getGroupById(id);
    if (!existingGroup) {
      throw new GroupNotFoundException(id);
    }
    const usage = await this.checkGroupUsage(id);
    if (usage) {
      throw new GroupDeleteNotAllowedException();
    }

    await this.dataSource.manager.transaction(async (entityManager) => {
      const groupRepo = entityManager.getRepository(Group);
      const groupRoleRepo = entityManager.getRepository(GroupRole);
      const groupPermissionRepo = entityManager.getRepository(GroupPermission);
      await groupPermissionRepo.softDelete({ groupId: id });
      await groupRoleRepo.softDelete({ groupId: id });
      await groupRepo.softDelete(id);
    });

    await this.groupCacheService.invalidateGroupRolesByGroupId(id);
    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return existingGroup;
  }

  async updateGroupPermissions(
    id: string,
    request: UpdateGroupPermissionInput,
  ): Promise<Permission[]> {
    const updatedGroup = await this.groupRepository.getGroupById(id);
    if (!updatedGroup) {
      throw new GroupNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.getPermissionsByIds(
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

    await this.dataSource.manager.transaction(async (entityManager) => {
      const groupPermissionsRepo = entityManager.getRepository(GroupPermission);
      await groupPermissionsRepo.remove(permissionsToBeRemovedFromGroup);
      await groupPermissionsRepo.save(groupPermission);
    });

    const permissions = await this.getGroupPermissions(id);

    await this.groupCacheService.invalidateGroupPermissionsByGroupId(id);
    return permissions;
  }

  async getGroupPermissions(id: string): Promise<Permission[]> {
    return this.permissionRepository.getPermissionsByGroupId(id);
  }

  async updateGroupUsers(id: string, userIds: string[]): Promise<User[]> {
    await this.getGroupById(id);
    const validUsersInRequest = await this.validateUsers(userIds);
    const existingUsersOfGroup = await this.getGroupUsers(id);

    const usersToBeRemovedFromGroup: UserGroup[] = existingUsersOfGroup
      .filter((user) => !validUsersInRequest.has(user.id))
      .map((user) => ({ userId: user.id, groupId: id }));
    const userGroups = this.userGroupRepository.create(
      userIds.map((userId) => ({ userId: userId, groupId: id })),
    );

    await this.dataSource.manager.transaction(async (entityManager) => {
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

  async getGroupUsers(groupId: string): Promise<User[]> {
    return this.userRepository.getUsersByGroupId(groupId);
  }

  private async validateUsers(userIds: string[]): Promise<Set<string>> {
    const usersInRequest = await this.userRepository.getUsersByIds(userIds);
    const validUsersInRequest: Set<string> = new Set(
      usersInRequest.map((p) => p.id),
    );
    if (usersInRequest.length !== userIds.length) {
      throw new UserNotFoundException(
        userIds.filter((u) => !validUsersInRequest.has(u)).toString(),
      );
    }
    return validUsersInRequest;
  }

  async getGroupRoles(id: string): Promise<Role[]> {
    return this.rolesRepository.getRolesForGroupId(id);
  }

  async updateGroupRoles(
    id: string,
    request: UpdateGroupRoleInput,
  ): Promise<Role[]> {
    const updatedGroup = await this.groupRepository.getGroupById(id);
    if (!updatedGroup) {
      throw new GroupNotFoundException(id);
    }

    const existingRolesOfGroup = await this.getGroupRoles(id);
    const rolesInRequest = await this.rolesRepository.getRolesByIds(
      request.roles,
    );
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

    await this.dataSource.manager.transaction(async (entityManager) => {
      const groupRolesRepo = entityManager.getRepository(GroupRole);
      await groupRolesRepo.remove(rolesToBeRemovedFromGroup);
      await groupRolesRepo.save(groupRoles);
    });

    const roles = await this.getGroupRoles(id);
    await this.groupCacheService.invalidateGroupRolesByGroupId(id);
    return roles;
  }

  private async checkGroupUsage(id: string) {
    const userCount = await this.userRepository.getUserCountForGroupId(id);
    return userCount != 0;
  }

  async getAllGroupPermissions(groupId: string) {
    const groupPermissions: Permission[] = await this.getGroupPermissions(
      groupId,
    );
    const groupRolePermissions: Permission[] = await this.permissionRepository.getGroupRolePermissionsByGroupId(
      groupId,
    );
    const allPermissionsOfGroup = groupPermissions.concat(groupRolePermissions);
    const permissionIds = allPermissionsOfGroup.map(
      (permission) => permission.id,
    );
    const filteredPermissions = allPermissionsOfGroup.filter(
      ({ id }, index) => !permissionIds.includes(id, index + 1),
    );
    return filteredPermissions;
  }
}
