import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { UserNotAuthorized } from '../../authentication/exception/userauth.exception';
import { FilterBuilder } from '../../common/filter.builder';
import { SearchEntity } from '../../constants/search.entity.enum';
import {
  FilterField,
  OperationType,
  SortDirection,
  Status,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  UserInputFilter,
} from '../../schema/graphql.schema';
import Group from '../entity/group.entity';
import Permission from '../entity/permission.entity';
import User from '../entity/user.entity';
import UserGroup from '../entity/userGroup.entity';
import UserPermission from '../entity/userPermission.entity';
import { GroupNotFoundException } from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import { UserNotFoundException } from '../exception/user.exception';
import { GroupRepository } from '../repository/group.repository';
import { PermissionRepository } from '../repository/permission.repository';
import { UserRepository } from '../repository/user.repository';
import { UserGroupRepository } from '../repository/userGroup.repository';
import { UserPermissionRepository } from '../repository/userPermission.repository';
import { GroupCacheServiceInterface } from './groupcache.service.interface';
import { PermissionCacheServiceInterface } from './permissioncache.service.interface';
import { RoleCacheServiceInterface } from './rolecache.service.interface';
import SearchService from './search.service';
import { UserServiceInterface } from './user.service.interface';
import { UserCacheServiceInterface } from './usercache.service.interface';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    private userRepository: UserRepository,
    private userGroupRepository: UserGroupRepository,
    private groupRepository: GroupRepository,
    private userPermissionRepository: UserPermissionRepository,
    private permissionRepository: PermissionRepository,
    @Inject(UserCacheServiceInterface)
    private userCacheService: UserCacheServiceInterface,
    @Inject(GroupCacheServiceInterface)
    private groupCacheService: GroupCacheServiceInterface,
    @Inject(PermissionCacheServiceInterface)
    private permissionCacheService: PermissionCacheServiceInterface,
    private dataSource: DataSource,
    private searchService: SearchService,
    @Inject(RoleCacheServiceInterface)
    private roleCacheService: RoleCacheServiceInterface,
  ) {}

  getAllUsers(input?: UserInputFilter): Promise<[User[], number]> {
    const SortFieldMapping = new Map([
      ['firstName', 'user.firstName'],
      ['updatedAt', 'user.updated_at'],
    ]);
    const filterFieldMapping = new Map([['status', 'user.status']]);

    const applyUserGroupFilter = (
      field: FilterField,
      queryBuilder: SelectQueryBuilder<User>,
    ) => {
      if (field.field == 'group') {
        queryBuilder.innerJoin(
          UserGroup,
          'userGroup',
          'userGroup.userId = user.id AND userGroup.groupId IN (:...groupIds)',
          { groupIds: field.value },
        );
      }
    };
    const qb = this.userRepository.createQueryBuilder('user');
    if (input?.search) {
      this.searchService.generateSearchTermForEntity(
        qb,
        SearchEntity.USER,
        input.search,
      );
    }
    if (input?.filter) {
      input.filter.operands.forEach((o) => applyUserGroupFilter(o, qb));
      new FilterBuilder<User>(qb, filterFieldMapping).build(input.filter);
    }
    if (input?.sort) {
      const sortField = SortFieldMapping.get(input.sort.field);
      sortField
        ? qb.orderBy(sortField, input.sort.direction)
        : qb.orderBy('user.updated_at', SortDirection.DESC);
    } else {
      qb.orderBy('user.updated_at', SortDirection.DESC);
    }
    if (input?.pagination) {
      qb.limit(input?.pagination?.limit ?? 10).offset(
        input?.pagination?.offset ?? 0,
      );
    }

    return qb.getManyAndCount();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    if (user) {
      return user;
    }
    throw new UserNotFoundException(id);
  }

  async createUser(user: User): Promise<User> {
    const savedUser = await this.userRepository.save(user);
    if (savedUser) {
      return savedUser;
    }
    throw new UserNotFoundException(user.email || user.phone || '');
  }

  async updateUser(id: string, user: UpdateUserInput): Promise<User> {
    const updatedUser = await this.userRepository.updateUserById(id, user);

    if (!updatedUser) {
      throw new UserNotFoundException(id);
    }

    return this.getUserById(id);
  }

  async updateUserGroups(
    id: string,
    user: UpdateUserGroupInput,
  ): Promise<Group[]> {
    await this.getUserById(id);
    const groupsInRequest = await this.groupRepository.getGroupsByIds(
      user.groups,
    );
    const existingGroupsOfUser = await this.getUserGroups(id);

    const validGroupsInRequest: Set<string> = new Set(
      groupsInRequest.map((p) => p.id),
    );
    if (groupsInRequest.length !== user.groups.length) {
      throw new GroupNotFoundException(
        user.groups.filter((p) => !validGroupsInRequest.has(p)).toString(),
      );
    }

    const groupsToBeRemovedFromUser: UserGroup[] = existingGroupsOfUser
      .filter((p) => !validGroupsInRequest.has(p.id))
      .map((g) => ({ userId: id, groupId: g.id }));
    const userGroups = this.userGroupRepository.create(
      user.groups.map((group) => ({ userId: id, groupId: group })),
    );

    await this.dataSource.manager.transaction(async (entityManager) => {
      const userGroupsRepo = entityManager.getRepository(UserGroup);
      await userGroupsRepo.remove(groupsToBeRemovedFromUser);
      await userGroupsRepo.save(userGroups);
    });

    const groups = await this.getUserGroups(id);
    await this.userCacheService.invalidateUserGroupsCache(id);
    return groups;
  }

  async getUserGroups(id: string): Promise<Group[]> {
    return this.groupRepository.getGroupsForUserId(id);
  }

  async updateUserPermissions(
    id: string,
    request: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    await this.getUserById(id);
    const existingUserPermissions: Permission[] = await this.getUserPermissions(
      id,
    );
    const permissionsInRequest: Permission[] = await this.permissionRepository.getPermissionsByIds(
      request.permissions,
    );
    const validPermissions = new Set(permissionsInRequest.map((p) => p.id));
    if (permissionsInRequest.length !== request.permissions.length) {
      throw new PermissionNotFoundException(
        request.permissions.filter((p) => !validPermissions.has(p)).toString(),
      );
    }

    const userPermissionsToBeRemoved: UserPermission[] = existingUserPermissions
      .filter((p) => !validPermissions.has(p.id))
      .map((p) => ({ userId: id, permissionId: p.id }));
    this.userPermissionRepository.remove(userPermissionsToBeRemoved);

    const userPermissionsCreated = this.userPermissionRepository.create(
      request.permissions.map((permission) => ({
        userId: id,
        permissionId: permission,
      })),
    );

    const userPermissionsUpdated = await this.dataSource.transaction(
      async (entityManager) => {
        const userPermissionsRepo = entityManager.getRepository(UserPermission);
        await userPermissionsRepo.remove(userPermissionsToBeRemoved);
        return await userPermissionsRepo.save(userPermissionsCreated);
      },
    );

    const userPermissions = await this.permissionRepository.getPermissionsByIds(
      userPermissionsUpdated.map((u) => u.permissionId),
    );

    await this.userCacheService.invalidateUserPermissionsCache(id);
    return userPermissions;
  }

  async getUserPermissions(id: string): Promise<Permission[]> {
    return this.permissionRepository.getPermissionsByUserId(id);
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.dataSource.manager.transaction(async (entityManager) => {
      const userRepo = entityManager.getRepository(User);
      const userGroupRepo = entityManager.getRepository(UserGroup);
      const userPermissionRepo = entityManager.getRepository(UserPermission);
      await userPermissionRepo.softDelete({ userId: id });
      await userGroupRepo.softDelete({ userId: id });
      await userRepo.update(id, { status: Status.INACTIVE });
      await userRepo.softDelete(id);
    });

    await this.userCacheService.invalidateUserPermissionsCache(id);
    await this.userCacheService.invalidateUserGroupsCache(id);
    return user;
  }

  public async getAllUserpermissionIds(id: string): Promise<Set<string>> {
    const userGroups = await this.userCacheService.getUserGroupsByUserId(id);
    const groupPermissions: string[] = (
      await Promise.all(
        userGroups.map((x) =>
          this.groupCacheService.getGroupPermissionsFromGroupId(x),
        ),
      )
    ).flat(1);
    const groupRoles: string[] = (
      await Promise.all(
        userGroups.map((x) =>
          this.groupCacheService.getGroupRolesFromGroupId(x),
        ),
      )
    ).flat(1);
    const distinctGroupRoles = [...new Set(groupRoles)];
    const groupRolePermissions: string[] = (
      await Promise.all(
        distinctGroupRoles.map((x) =>
          this.roleCacheService.getRolePermissionsFromRoleId(x),
        ),
      )
    ).flat(1);
    const userPermissions: string[] = await this.userCacheService.getUserPermissionsByUserId(
      id,
    );
    const allPermissionsOfUser = new Set(
      userPermissions.concat(groupPermissions, groupRolePermissions),
    );
    return allPermissionsOfUser;
  }

  public async permissionsOfUser(id: string): Promise<Permission[]> {
    const setOfPermissions: Set<string> = await this.getAllUserpermissionIds(
      id,
    );
    const arrOfPermissions = Array.from(setOfPermissions);
    const allPermissions = await this.permissionRepository.getPermissionsByIds(
      arrOfPermissions,
    );
    return allPermissions;
  }

  async verifyUserPermissions(
    id: string,
    permissionsToVerify: string[],
    operation: OperationType = OperationType.AND,
  ): Promise<boolean> {
    const permissionsRequired = (
      await Promise.all(
        permissionsToVerify.map((p) =>
          this.permissionCacheService.getPermissionsFromCache(p),
        ),
      )
    ).flat(1);
    if (permissionsRequired.length !== permissionsToVerify.length) {
      const validPermissions = new Set(permissionsRequired.map((p) => p.name));
      throw new PermissionNotFoundException(
        permissionsToVerify.filter((p) => !validPermissions.has(p)).toString(),
      );
    }
    const allPermissionsOfUser = await this.getAllUserpermissionIds(id);
    const requiredPermissionsWithUser = permissionsRequired
      .map((x) => x.id)
      .filter((x) => allPermissionsOfUser.has(x));
    const permissions = permissionsRequired
      .map(({ id, name }) => {
        if (!requiredPermissionsWithUser.includes(id)) return name;
      })
      .filter((x) => x != undefined);
    if (permissions.length) {
      throw new UserNotAuthorized(permissions);
    }
    switch (operation) {
      case OperationType.AND:
        return (
          permissionsRequired.length > 0 &&
          requiredPermissionsWithUser.length === permissionsRequired.length
        );
      case OperationType.OR:
        return requiredPermissionsWithUser.length > 0;
      default:
        return false;
    }
  }

  async verifyDuplicateUser(
    email?: string,
    phone?: string,
  ): Promise<{ existingUserDetails?: User | null; duplicate: string }> {
    let user;
    if (email) {
      user = await this.userRepository.getUserByEmail(email);
    }

    if (phone && !user) {
      user = await this.userRepository.getUserByPhone(phone);
      return { existingUserDetails: user, duplicate: 'phone number' };
    }

    return { existingUserDetails: user, duplicate: 'email' };
  }

  async getUserDetailsByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<any> {
    let user;
    if (email) {
      user = await this.userRepository.getUserByEmail(email);
    }

    if (phone && !user) {
      user = await this.userRepository.getUserByPhone(phone);
    }

    return user;
  }

  async getUserDetailsByUsername(email?: string, phone?: string) {
    const nullCheckedEmail = email ? email : null;
    const nullCheckedPhone = phone ? phone : null;
    if (!nullCheckedEmail && !nullCheckedPhone) {
      throw new BadRequestException(
        'Username should be provided with email or phone',
      );
    }
    let query = this.userRepository.createQueryBuilder('user');
    if (email) {
      query = query.orWhere('lower(user.email) = lower(:email)', {
        email: nullCheckedEmail,
      });
    }
    if (phone) {
      query = query.orWhere('user.phone = :phone', { phone: nullCheckedPhone });
    }
    return query.getOne();
  }

  async updateField(id: string, field: string, value: any): Promise<User> {
    await this.userRepository.update(id, { [field]: value });
    const updatedUser = await this.userRepository.getUserById(id);
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserNotFoundException(id);
  }

  async getActiveUserByPhoneNumber(phone: string) {
    return this.userRepository.getUserByPhone(phone);
  }

  async setOtpSecret(user: User, twoFASecret: string) {
    await this.userRepository.update(user.id, { twoFASecret });
  }
}
