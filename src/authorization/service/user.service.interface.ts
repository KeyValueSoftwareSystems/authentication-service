import User from '../entity/user.entity';
import {
  OperationType,
  UpdateUserGroupInput,
  UpdateUserInput,
  UpdateUserPermissionInput,
  UserInputFilter,
} from '../../schema/graphql.schema';
import Group from '../entity/group.entity';
import Permission from '../entity/permission.entity';

export default interface UserServiceInterface {
  getAllUsers(input?: UserInputFilter): Promise<[User[], number]>;

  getUserById(id: string): Promise<User>;

  createUser(user: User): Promise<User>;

  updateUser(id: string, user: UpdateUserInput): Promise<User>;

  updateUserGroups(id: string, user: UpdateUserGroupInput): Promise<Group[]>;

  getUserGroups(id: string): Promise<Group[]>;

  updateUserPermissions(
    id: string,
    request: UpdateUserPermissionInput,
  ): Promise<Permission[]>;

  getUserPermissions(id: string): Promise<Permission[]>;

  deleteUser(id: string): Promise<User>;

  getAllUserpermissionIds(id: string): Promise<Set<string>>;

  permissionsOfUser(id: string): Promise<Permission[]>;

  verifyUserPermissions(
    id: string,
    permissionsToVerify: string[],
    operation?: OperationType,
  ): Promise<boolean>;

  verifyDuplicateUser(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<{ existingUserDetails?: User | null; duplicate: string }>;

  getUserDetailsByEmailOrPhone(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<any>;

  getUserDetailsByUsername(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<User | null>;

  updateField(id: string, field: string, value: any): Promise<User>;

  getActiveUserByPhoneNumber(phone: string): Promise<User | null>;

  setOtpSecret(user: User, twoFASecret: string): Promise<void>;
}
