
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum OperationType {
    AND = "AND",
    OR = "OR"
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

export interface NewEntityInput {
    name: string;
}

export interface UpdateEntityInput {
    name: string;
    active?: boolean;
}

export interface UpdateEntityPermissionInput {
    permissions: string[];
}

export interface NewGroupInput {
    name: string;
}

export interface UpdateGroupInput {
    name: string;
    active?: boolean;
}

export interface UpdateGroupPermissionInput {
    permissions: string[];
}

export interface NewPermissionInput {
    name: string;
}

export interface UpdatePermissionInput {
    name: string;
    active?: boolean;
}

export interface UpdateUserInput {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    active?: boolean;
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

export interface IMutation {
    passwordLogin(input: UserPasswordLoginInput): TokenResponse | Promise<TokenResponse>;
    passwordSignup(input: UserPasswordSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    otpLogin(input: UserOTPLoginInput): TokenResponse | Promise<TokenResponse>;
    otpSignup(input: UserOTPSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    changePassword(input: UserPasswordInput): User | Promise<User>;
    refresh(input: RefreshTokenInput): TokenResponse | Promise<TokenResponse>;
    logout(): string | Promise<string>;
    generateOtp(input?: GenerateOtpInput): string | Promise<string>;
    createEntity(input: NewEntityInput): Entity | Promise<Entity>;
    updateEntity(id: string, input: UpdateEntityInput): Entity | Promise<Entity>;
    deleteEntity(id: string): Entity | Promise<Entity>;
    updateEntityPermissions(id: string, input: UpdateGroupPermissionInput): EntityPermission[] | Promise<EntityPermission[]>;
    createGroup(input: NewGroupInput): Group | Promise<Group>;
    updateGroup(id: string, input: UpdateGroupInput): Group | Promise<Group>;
    deleteGroup(id: string): Group | Promise<Group>;
    updateGroupPermissions(id: string, input: UpdateGroupPermissionInput): GroupPermission[] | Promise<GroupPermission[]>;
    createPermission(input: NewPermissionInput): Permission | Promise<Permission>;
    updatePermission(id: string, input: UpdatePermissionInput): Permission | Promise<Permission>;
    deletePermission(id: string): Permission | Promise<Permission>;
    updateUser(id: string, input: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
    updateUserPermissions(id: string, input: UpdateUserPermissionInput): UserPermissions[] | Promise<UserPermissions[]>;
    updateUserGroups(id: string, input: UpdateUserGroupInput): UserGroupResponse[] | Promise<UserGroupResponse[]>;
}

export interface TokenResponse {
    refreshToken: string;
    accessToken: string;
}

export interface UserSignupResponse {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    active: boolean;
}

export interface Entity {
    id: string;
    name: string;
    active: boolean;
}

export interface EntityPermission {
    id: string;
    name: string;
    active?: boolean;
}

export interface IQuery {
    getEntities(): Entity[] | Promise<Entity[]>;
    getEntity(id: string): Entity | Promise<Entity>;
    getEntityPermissions(id: string): EntityPermission[] | Promise<EntityPermission[]>;
    getGroups(): Group[] | Promise<Group[]>;
    getGroup(id: string): Group | Promise<Group>;
    getGroupPermissions(id: string): GroupPermission[] | Promise<GroupPermission[]>;
    getPermissions(): Permission[] | Promise<Permission[]>;
    getPermission(id: string): Permission | Promise<Permission>;
    getUsers(): User[] | Promise<User[]>;
    getUser(id: string): User | Promise<User>;
    getUserGroups(id: string): UserGroupResponse[] | Promise<UserGroupResponse[]>;
    getUserPermissions(id: string): UserPermissions[] | Promise<UserPermissions[]>;
    verifyUserPermission(id: string, params: UserPermissionsVerification): boolean | Promise<boolean>;
}

export interface Group {
    id: string;
    name: string;
    active: boolean;
}

export interface GroupPermission {
    id: string;
    name: string;
    active?: boolean;
}

export interface Permission {
    id: string;
    name: string;
    active: boolean;
}

export interface User {
    id: string;
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    active: boolean;
}

export interface UserGroupResponse {
    id: string;
    name: string;
    active?: boolean;
}

export interface UserPermissions {
    id: string;
    name: string;
    active?: boolean;
}
