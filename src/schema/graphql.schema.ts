
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface UserSignupInput {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface UserLoginInput {
    username: string;
    password: string;
}

export interface UserPasswordInput {
    currentPassword: string;
    newPassword: string;
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

export interface NewUserInput {
    email?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
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

export interface IMutation {
    login(input: UserLoginInput): TokenResponse | Promise<TokenResponse>;
    signup(input: UserSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    changePassword(input: UserPasswordInput): User | Promise<User>;
    createGroup(input?: NewGroupInput): Group | Promise<Group>;
    updateGroup(id: string, input?: UpdateGroupInput): Group | Promise<Group>;
    deleteGroup(id: string): Group | Promise<Group>;
    updateGroupPermissions(id: string, input?: UpdateGroupPermissionInput): GroupPermission[] | Promise<GroupPermission[]>;
    createPermission(input?: NewPermissionInput): Permission | Promise<Permission>;
    updatePermission(id: string, input?: UpdatePermissionInput): Permission | Promise<Permission>;
    deletePermission(id: string): Permission | Promise<Permission>;
    updateUser(id: string, input?: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
    updateUserPermissions(id: string, input?: UpdateUserPermissionInput): UserPermissions[] | Promise<UserPermissions[]>;
    updateUserGroups(id: string, input?: UpdateUserGroupInput): UserGroupResponse[] | Promise<UserGroupResponse[]>;
}

export interface TokenResponse {
    expiresInSeconds: number;
    token: string;
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

export interface IQuery {
    getGroups(): Group[] | Promise<Group[]>;
    getGroup(id: string): Group | Promise<Group>;
    getPermissions(): Permission[] | Promise<Permission[]>;
    getPermission(id: string): Permission | Promise<Permission>;
    getUsers(): User[] | Promise<User[]>;
    getUser(id: string): User | Promise<User>;
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
