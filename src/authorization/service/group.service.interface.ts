import Group from '../entity/group.entity';
import User from '../entity/user.entity';
import Permission from '../entity/permission.entity';
import Role from '../entity/role.entity';
import {
  GroupInputFilter,
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
  UpdateGroupRoleInput,
} from 'src/schema/graphql.schema';

export interface GroupServiceInterface {
  getAllGroups(input?: GroupInputFilter): Promise<[Group[], number]>;

  getGroupById(id: string): Promise<Group>;

  getGroupUsers(id: string): Promise<User[]>;

  createGroup(group: NewGroupInput): Promise<Group>;

  updateGroup(id: string, group: UpdateGroupInput): Promise<Group>;

  deleteGroup(id: string): Promise<Group>;

  updateGroupPermissions(
    id: string,
    request: UpdateGroupPermissionInput,
  ): Promise<Permission[]>;

  getGroupPermissions(id: string): Promise<Permission[]>;

  updateGroupUsers(id: string, userIds: string[]): Promise<User[]>;

  getGroupRoles(id: string): Promise<Role[]>;

  updateGroupRoles(id: string, request: UpdateGroupRoleInput): Promise<Role[]>;

  getAllGroupPermissions(groupId: string): Promise<Permission[]>;
}

export const GroupServiceInterface = Symbol('GroupServiceInterface');
