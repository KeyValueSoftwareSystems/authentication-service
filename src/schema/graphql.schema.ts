
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum Status {
    INVITED = "INVITED",
    INACTIVE = "INACTIVE",
    ACTIVE = "ACTIVE"
}

export enum OperationType {
    AND = "AND",
    OR = "OR"
}

export enum FilterConditions {
    EQUALS = "EQUALS",
    IN = "IN"
}

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}

export interface UserPasswordSignupInput {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface UserOTPSignupInput {
    email?: string;
    phone: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface UserPasswordLoginInput {
    username: string;
    password: string;
}

export interface UserOTPLoginInput {
    username: string;
    otp: string;
}

export interface UserPasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenInput {
    refreshToken: string;
}

export interface GenerateOtpInput {
    phone: string;
}

export interface Enable2FAInput {
    code: string;
}

export interface UserInviteTokenSignupInput {
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface UserPasswordForInviteInput {
    inviteToken: string;
    password: string;
}

export interface NewEntityInput {
    name: string;
}

export interface UpdateEntityInput {
    name: string;
}

export interface UpdateEntityPermissionInput {
    permissions: string[];
}

export interface NewGroupInput {
    name: string;
}

export interface UpdateGroupInput {
    name?: string;
    users?: string[];
}

export interface UpdateGroupPermissionInput {
    permissions: string[];
}

export interface UpdateGroupRoleInput {
    roles: string[];
}

export interface GroupInputFilter {
    search?: GroupSearchInput;
    sort?: SortInput;
    pagination?: PaginationInput;
}

export interface GroupSearchInput {
    and?: GroupSearchCondition;
    or?: GroupSearchCondition;
}

export interface GroupSearchCondition {
    name?: StringSearchCondition;
}

export interface NewPermissionInput {
    name: string;
    label?: string;
}

export interface UpdatePermissionInput {
    name: string;
    label?: string;
}

export interface NewRoleInput {
    name: string;
}

export interface UpdateRoleInput {
    name: string;
}

export interface UpdateRolePermissionInput {
    permissions: string[];
}

export interface RoleInputFilter {
    search?: RoleSearchInput;
    sort?: SortInput;
    pagination?: PaginationInput;
}

export interface RoleSearchInput {
    and?: RoleSearchCondition;
    or?: RoleSearchCondition;
}

export interface RoleSearchCondition {
    name?: StringSearchCondition;
}

export interface UpdateUserInput {
    firstName?: string;
    middleName?: string;
    lastName?: string;
}

export interface UpdateUserPermissionInput {
    permissions: string[];
}

export interface UpdateUserGroupInput {
    groups: string[];
}

export interface UserPermissionsVerification {
    permissions: string[];
    operation?: OperationType;
}

export interface UserInputFilter {
    search?: UserSearchInput;
    filter?: FilterInput;
    sort?: SortInput;
    pagination?: PaginationInput;
}

export interface UserSearchInput {
    and?: UserSearchParameter;
    or?: UserSearchParameter;
}

export interface UserSearchParameter {
    email?: StringSearchCondition;
    firstName?: StringSearchCondition;
    middleName?: StringSearchCondition;
    lastName?: StringSearchCondition;
}

export interface StringSearchCondition {
    contains?: string;
}

export interface FilterInput {
    operands: FilterField[];
}

export interface FilterField {
    condition: FilterConditions;
    field: string;
    value: string[];
}

export interface SortInput {
    field: string;
    direction: SortDirection;
}

export interface PaginationInput {
    limit?: number;
    offset?: number;
}

export interface Paginated {
    totalCount?: number;
}

export interface IMutation {
    passwordLogin(input: UserPasswordLoginInput): TokenResponse | Promise<TokenResponse>;
    passwordSignup(input: UserPasswordSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    inviteTokenSignup(input?: UserInviteTokenSignupInput): InviteTokenResponse | Promise<InviteTokenResponse>;
    refreshInviteToken(id: string): InviteTokenResponse | Promise<InviteTokenResponse>;
    setPasswordForInvite(input?: UserPasswordForInviteInput): UserSignupResponse | Promise<UserSignupResponse>;
    revokeInviteToken(id: string): boolean | Promise<boolean>;
    otpLogin(input: UserOTPLoginInput): TokenResponse | Promise<TokenResponse>;
    otpSignup(input: UserOTPSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    changePassword(input: UserPasswordInput): User | Promise<User>;
    refresh(input: RefreshTokenInput): TokenResponse | Promise<TokenResponse>;
    logout(): string | Promise<string>;
    generateOtp(input?: GenerateOtpInput): string | Promise<string>;
    createEntity(input: NewEntityInput): Entity | Promise<Entity>;
    updateEntity(id: string, input: UpdateEntityInput): Entity | Promise<Entity>;
    deleteEntity(id: string): Entity | Promise<Entity>;
    updateEntityPermissions(id: string, input: UpdateGroupPermissionInput): Permission[] | Promise<Permission[]>;
    createGroup(input: NewGroupInput): Group | Promise<Group>;
    updateGroup(id: string, input: UpdateGroupInput): Group | Promise<Group>;
    deleteGroup(id: string): Group | Promise<Group>;
    updateGroupPermissions(id: string, input: UpdateGroupPermissionInput): Permission[] | Promise<Permission[]>;
    updateGroupRoles(id: string, input: UpdateGroupRoleInput): GroupRole[] | Promise<GroupRole[]>;
    createPermission(input: NewPermissionInput): Permission | Promise<Permission>;
    updatePermission(id: string, input: UpdatePermissionInput): Permission | Promise<Permission>;
    deletePermission(id: string): Permission | Promise<Permission>;
    createRole(input: NewRoleInput): Role | Promise<Role>;
    updateRole(id: string, input: UpdateRoleInput): Role | Promise<Role>;
    deleteRole(id: string): Role | Promise<Role>;
    updateRolePermissions(id: string, input: UpdateRolePermissionInput): Permission[] | Promise<Permission[]>;
    updateUser(id: string, input: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
    updateUserPermissions(id: string, input: UpdateUserPermissionInput): Permission[] | Promise<Permission[]>;
    updateUserGroups(id: string, input: UpdateUserGroupInput): UserGroupResponse[] | Promise<UserGroupResponse[]>;
}

export interface TokenResponse {
    refreshToken: string;
    accessToken: string;
    user: User;
}

export interface UserSignupResponse {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface InviteTokenResponse {
    inviteToken: string;
    tokenExpiryTime: string;
    user: User;
}

export interface Entity {
    id: string;
    name: string;
    permissions?: Permission[];
}

export interface IQuery {
    getEntities(): Entity[] | Promise<Entity[]>;
    getEntity(id: string): Entity | Promise<Entity>;
    getEntityPermissions(id: string): Permission[] | Promise<Permission[]>;
    getGroups(input?: GroupInputFilter): GroupPaginated | Promise<GroupPaginated>;
    getGroup(id: string): Group | Promise<Group>;
    getGroupPermissions(id: string): Permission[] | Promise<Permission[]>;
    getGroupRoles(id: string): GroupRole[] | Promise<GroupRole[]>;
    getPermissions(): Permission[] | Promise<Permission[]>;
    getPermission(id: string): Permission | Promise<Permission>;
    getRoles(input?: RoleInputFilter): RolePaginated | Promise<RolePaginated>;
    getRole(id: string): Role | Promise<Role>;
    getRolePermissions(id: string): Permission[] | Promise<Permission[]>;
    getUsers(input?: UserInputFilter): UserPaginated | Promise<UserPaginated>;
    getUser(id: string): User | Promise<User>;
    getUserGroups(id: string): UserGroupResponse[] | Promise<UserGroupResponse[]>;
    getUserPermissions(id: string): Permission[] | Promise<Permission[]>;
    verifyUserPermission(params: UserPermissionsVerification): boolean | Promise<boolean>;
}

export interface Group {
    id: string;
    name: string;
    users?: User[];
    roles?: Role[];
    permissions?: Permission[];
    allPermissions?: Permission[];
}

export interface GroupRole {
    id: string;
    name: string;
}

export interface GroupPaginated extends Paginated {
    totalCount?: number;
    results?: Group[];
}

export interface Permission {
    id: string;
    name: string;
    label?: string;
}

export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
}

export interface RolePaginated extends Paginated {
    totalCount?: number;
    results?: Role[];
}

export interface UserPaginated extends Paginated {
    totalCount?: number;
    results?: User[];
}

export interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    status: Status;
    groups?: Group[];
    permissions?: Permission[];
    inviteToken?: string;
}

export interface UserGroupResponse {
    id: string;
    name: string;
}
