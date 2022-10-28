import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Connection,
  Equal,
  FindOperator,
  ILike,
  Like,
  Not,
  Repository,
} from 'typeorm';

import User from '../entity/user.entity';
import {
  OperationType,
  SearchCondition,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  UserInputFilter,
  UserSearchInput,
} from '../../schema/graphql.schema';
import { UserNotFoundException } from '../exception/user.exception';
import Group from '../entity/group.entity';
import Permission from '../entity/permission.entity';
import UserGroup from '../entity/userGroup.entity';
import UserPermission from '../entity/userPermission.entity';
import GroupPermission from '../entity/groupPermission.entity';
import { GroupNotFoundException } from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import UserCacheService from './usercache.service';
import { RedisCacheService } from '../../cache/redis-cache/redis-cache.service';
import GroupCacheService from './groupcache.service';
import PermissionCacheService from './permissioncache.service';
import RoleCacheService from './rolecache.service';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private userGroupRepository: Repository<UserGroup>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(GroupPermission)
    private groupPermissionRepository: Repository<GroupPermission>,
    private userCacheService: UserCacheService,
    private groupCacheService: GroupCacheService,
    private permissionCacheService: PermissionCacheService,
    private cacheManager: RedisCacheService,
    private connection: Connection,
    private roleCacheService: RoleCacheService,
  ) {}

  getAllUsers(input?: UserInputFilter): Promise<User[]> {
    let searchTerm: { [key: string]: FindOperator<string | undefined> }[] = [];
    if (input) {
      if (input.search) {
        searchTerm = this.generateSearchTermForUsers(input.search);
      }
    }
    return this.usersRepository.find({
      where: searchTerm,
    });
  }

  generateSearchTermForUsers(
    input: UserSearchInput,
  ): {
    [key: string]: FindOperator<string | undefined>;
  }[] {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.email) {
        andConditions[`email`] = this.generateWhereClauseForSearchTerm(
          input.and.email,
        );
      }
      if (input.and.firstName) {
        andConditions[`firstName`] = this.generateWhereClauseForSearchTerm(
          input.and.firstName,
        );
      }
      if (input.and.middleName) {
        andConditions[`middleName`] = this.generateWhereClauseForSearchTerm(
          input.and.middleName,
        );
      }
      if (input.and.lastName) {
        andConditions[`lastName`] = this.generateWhereClauseForSearchTerm(
          input.and.lastName,
        );
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.email) {
        searchWhereCondition.push({
          email: this.generateWhereClauseForSearchTerm(input.or.email),
        });
      }
      if (input.or.firstName) {
        searchWhereCondition.push({
          firstName: this.generateWhereClauseForSearchTerm(input.or.firstName),
        });
      }
      if (input.or.middleName) {
        searchWhereCondition.push({
          middleName: this.generateWhereClauseForSearchTerm(
            input.or.middleName,
          ),
        });
      }
      if (input.or.lastName) {
        searchWhereCondition.push({
          lastName: this.generateWhereClauseForSearchTerm(input.or.lastName),
        });
      }
    }
    return searchWhereCondition;
  }

  public generateWhereClauseForSearchTerm(
    input: SearchCondition,
  ): FindOperator<string | undefined> {
    if (input.contains) {
      return ILike(`%${input.contains}%`);
    } else if (input.equals) {
      return Equal(input.equals);
    } else {
      return Like(`%%`);
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new UserNotFoundException(id);
  }

  async createUser(user: User): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const result = await this.usersRepository.insert(newUser);
    const savedUser = await this.usersRepository.findOne(result.raw[0].id);
    if (savedUser) {
      return savedUser;
    }
    throw new UserNotFoundException(user.email || user.phone || '');
  }

  async updateUser(id: string, user: UpdateUserInput): Promise<User> {
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    const newUser = this.usersRepository.create(user);
    await this.usersRepository.update(id, newUser);
    return { ...existingUser, ...newUser };
  }

  async updateUserGroups(
    id: string,
    user: UpdateUserGroupInput,
  ): Promise<Group[]> {
    await this.getUserById(id);
    const groupsInRequest = await this.groupRepository.findByIds(user.groups);
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

    await this.connection.manager.transaction(async (entityManager) => {
      const userGroupsRepo = entityManager.getRepository(UserGroup);
      await userGroupsRepo.remove(groupsToBeRemovedFromUser);
      await userGroupsRepo.save(userGroups);
    });

    const groups = await this.getUserGroups(id);
    await this.userCacheService.invalidateUserGroupsCache(id);
    return groups;
  }

  async getUserGroups(id: string): Promise<Group[]> {
    const groups = await this.groupRepository
      .createQueryBuilder()
      .leftJoinAndSelect(UserGroup, 'userGroup', 'Group.id = userGroup.groupId')
      .where('userGroup.userId = :userId', { userId: id })
      .getMany();
    return groups;
  }

  async updateUserPermissions(
    id: string,
    request: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    await this.getUserById(id);
    const existingUserPermissions: Permission[] = await this.getUserPermissions(
      id,
    );
    const permissionsInRequest: Permission[] = await this.permissionRepository.findByIds(
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

    const userPermissionsUpdated = await this.connection.transaction(
      async (entityManager) => {
        const userPermissionsRepo = entityManager.getRepository(UserPermission);
        await userPermissionsRepo.remove(userPermissionsToBeRemoved);
        return await userPermissionsRepo.save(userPermissionsCreated);
      },
    );

    const userPermissions = await this.permissionRepository.findByIds(
      userPermissionsUpdated.map((u) => u.permissionId),
    );

    await this.userCacheService.invalidateUserPermissionsCache(id);
    return userPermissions;
  }

  async getUserPermissions(id: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder()
      .leftJoinAndSelect(
        UserPermission,
        'userPermission',
        'Permission.id = userPermission.permissionId',
      )
      .where('userPermission.userId = :userId', { userId: id })
      .getMany();
    return permissions;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    await this.usersRepository.softDelete(id);
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

  public async permissionsOfUser(id: string) {
    const setOfPermissions: Set<string> = await this.getAllUserpermissionIds(
      id,
    );
    const arrOfPermissions = Array.from(setOfPermissions);
    const allPermissions = await this.permissionRepository.findByIds(
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
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<{ existingUserDetails: User | undefined; duplicate: string }> {
    let user;
    if (email) {
      user = await this.usersRepository
        .createQueryBuilder('user')
        .where('lower(user.email) = lower(:email)', { email })
        .getOne();
    }

    if (phone && !user) {
      user = await this.usersRepository.findOne({
        where: { phone: phone },
      });
      return { existingUserDetails: user, duplicate: 'phone number' };
    }

    return { existingUserDetails: user, duplicate: 'email' };
  }

  async getUserDetailsByEmailOrPhone(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<any> {
    let user;
    if (email) {
      user = await this.usersRepository
        .createQueryBuilder('user')
        .where('lower(user.email) = lower(:email)', { email })
        .getOne();
    }

    if (phone && !user) {
      user = await this.usersRepository.findOne({
        where: { phone: phone },
      });
    }

    return user;
  }

  async getUserDetailsByUsername(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<User | undefined> {
    const nullCheckedEmail = email ? email : null;
    const nullCheckedPhone = phone ? phone : null;
    if (!nullCheckedEmail && !nullCheckedPhone) {
      throw new BadRequestException(
        'Username should be provided with email or phone',
      );
    }
    let query = this.usersRepository.createQueryBuilder('user');
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
    await this.usersRepository.update(id, { [field]: value });
    const updatedUser = await this.usersRepository.findOne(id);
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserNotFoundException(id);
  }

  async getActiveUserByPhoneNumber(phone: string) {
    return await this.usersRepository.findOne({
      where: { phone },
    });
  }

  async setOtpSecret(user: User, twoFASecret: string) {
    await this.usersRepository.update(user.id, { twoFASecret });
  }
}
