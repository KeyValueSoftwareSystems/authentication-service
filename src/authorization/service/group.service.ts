import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GroupInputFilter,
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
} from '../../schema/graphql.schema';
import { Connection, Repository } from 'typeorm';
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
import SearchService from './search.service';
import { SearchEntity } from '../../constants/search.entity.enum';
import RolePermission from '../entity/rolePermission.entity';

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
    private searchService: SearchService,
  ) {}

  getAllGroups(input?: GroupInputFilter): Promise<[Group[], number]> {
    const SortFieldMapping = new Map([['name', 'Group.name']]);
    let queryBuilder = this.groupsRepository.createQueryBuilder();

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
    queryBuilder
      .limit(input?.pagination?.limit ?? 10)
      .offset(input?.pagination?.offset ?? 0);

    return queryBuilder.getManyAndCount();
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
    if (group.users) {
      await this.updateGroupUsers(id, group.users);
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

  private async validateUsers(userIds: string[]): Promise<Set<string>> {
    const usersInRequest = await this.userRepository.findByIds(userIds);
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
    const roles = await this.rolesRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect(GroupRole, 'groupRole', 'role.id = groupRole.roleId')
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

  async getAllGroupPermissions(groupId: string) {
    const groupPermissions: Permission[] = await this.getGroupPermissions(
      groupId,
    );
    const groupRolePermissions: Permission[] = await this.permissionRepository
      .createQueryBuilder('permission')
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
      .where('groupRole.groupId = :groupId', { groupId: groupId })
      .getMany();
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
