import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import User from '../entity/user.entity';
import {
  NewUserInput,
  OperationType,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
} from '../../schema/graphql.schema';
import { UserNotFoundException } from '../exception/user.exception';
import Group from '../entity/group.entity';
import Permission from '../entity/permission.entity';
import UserGroup from '../entity/userGroup.entity';
import UserPermission from '../entity/userPermission.entity';
import GroupPermission from '../entity/groupPermission.entity';
import { GroupNotFoundException } from '../exception/group.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';

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
  ) {}

  getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { active: true },
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id, {
      where: { active: true },
    });
    if (user) {
      return user;
    }
    throw new UserNotFoundException(id);
  }

  async createUser(user: NewUserInput): Promise<User> {
    const newUser = await this.usersRepository.create(user);
    const createdUser = await this.usersRepository.save(newUser);
    const savedUser = await this.usersRepository.findOne(createdUser.id, {
      where: { active: true },
    });
    if (savedUser) {
      return savedUser;
    }
    throw new UserNotFoundException(user.email);
  }

  async updateUser(id: string, user: UpdateUserInput): Promise<User> {
    const newUser = await this.usersRepository.create(user);
    await this.usersRepository.update(id, newUser);
    const updatedUser = await this.usersRepository.findOne(id, {
      where: { active: true },
    });
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserNotFoundException(id);
  }

  async updateUserGroups(
    id: string,
    user: UpdateUserGroupInput,
  ): Promise<Group[]> {
    const existingUser = await this.usersRepository.findOne(id, {
      where: { active: true },
    });
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    const groupsInRequest = await this.groupRepository.findByIds(user.groups);
    if (groupsInRequest.length !== user.groups.length) {
      const validGroups = groupsInRequest.map((p) => p.id);
      throw new GroupNotFoundException(
        user.groups.filter((p) => !validGroups.includes(p)).toString(),
      );
    }

    const userGroups = this.userGroupRepository.create(
      user.groups.map((group) => ({ userId: id, groupId: group })),
    );
    const updatedUserGroups = await this.userGroupRepository.save(userGroups);
    const groups = await this.groupRepository.findByIds(
      updatedUserGroups.map((u) => u.groupId),
    );
    return groups;
  }

  async updateUserPermissions(
    id: string,
    request: UpdateUserPermissionInput,
  ): Promise<Permission[]> {
    const existingUser = await this.usersRepository.findOne(id, {
      where: { active: true },
    });
    if (!existingUser) {
      throw new UserNotFoundException(id);
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

    const userPermissionsCreated = this.userPermissionRepository.create(
      request.permissions.map((permission) => ({
        userId: id,
        permissionId: permission,
      })),
    );
    const userPermissionsUpdated = await this.userPermissionRepository.save(
      userPermissionsCreated,
    );
    const userPermissions = await this.permissionRepository.findByIds(
      userPermissionsUpdated.map((u) => u.permissionId),
    );
    return userPermissions;
  }

  async deleteUser(id: string): Promise<User> {
    await this.usersRepository.update(id, { active: false });
    const deletedUser = await this.usersRepository.findOne(id);
    if (deletedUser) {
      return deletedUser;
    }
    throw new UserNotFoundException(id);
  }

  async verifyUserPermissions(
    id: string,
    permissionToVerify: string[],
    operation: OperationType = OperationType.AND,
  ): Promise<boolean> {
    const userGroups = await this.userGroupRepository.find({
      where: { userId: id },
    });
    const permissionsRequired = await this.permissionRepository.find({
      where: { name: In(permissionToVerify) },
    });
    if (permissionsRequired.length !== permissionToVerify.length) {
      const validPermissions = new Set(permissionsRequired.map((p) => p.name));
      throw new PermissionNotFoundException(
        permissionToVerify.filter((p) => !validPermissions.has(p)).toString(),
      );
    }
    const groupPermissions = (
      await this.groupPermissionRepository.find({
        where: { groupId: In(userGroups.map((x) => x.groupId)) },
      })
    ).map((x) => x.permissionId);
    const userPermissions = (
      await this.userPermissionRepository.find({ where: { userId: id } })
    ).map((x) => x.permissionId);

    const allPermissionsOfUser = new Set(
      userPermissions.concat(groupPermissions),
    );
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
}
