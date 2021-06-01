
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum OperationType {
    OR = "OR",
    AND = "AND"
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
    email: string;
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
    operationType?: OperationType;
}

export interface UpdateUserGroupInput {
    groups: string[];
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

export interface IMutation {
    createGroup(input?: NewGroupInput): Group | Promise<Group>;
    updateGroup(id: string, input?: UpdateGroupInput): Group | Promise<Group>;
    deleteGroup(id: string): Group | Promise<Group>;
    updateGroupPermissions(id: string, input?: UpdateGroupPermissionInput): GroupPermission[] | Promise<GroupPermission[]>;
    createPermission(input?: NewPermissionInput): Permission | Promise<Permission>;
    updatePermission(id: string, input?: UpdatePermissionInput): Permission | Promise<Permission>;
    deletePermission(id: string): Permission | Promise<Permission>;
    createUser(input?: NewUserInput): User | Promise<User>;
    updateUser(id: string, input?: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
    updateUserPermissions(id: string, input?: UpdateUserPermissionInput): UserPermissions[] | Promise<UserPermissions[]>;
    updateUserGroups(id: string, input?: UpdateUserGroupInput): UserGroupResponse[] | Promise<UserGroupResponse[]>;
}

export interface Permission {
    id: string;
    name: string;
    active: boolean;
}

export interface User {
    id: string;
    email: string;
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
