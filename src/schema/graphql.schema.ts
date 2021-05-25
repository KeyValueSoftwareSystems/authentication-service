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

export interface IMutation {
    login(input: UserLoginInput): TokenResponse | Promise<TokenResponse>;
    signup(input: UserSignupInput): UserSignupResponse | Promise<UserSignupResponse>;
    changePassword(input: UserPasswordInput): User | Promise<User>;
    updateUser(id: string, input?: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
}

export interface TokenResponse {
    expiresInSeconds: number;
    token: string;
}

export interface UserSignupResponse {
    email?: string;
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export interface User {
    id: string;
    email?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    active: boolean;
}

export interface IQuery {
    getUsers(): User[] | Promise<User[]>;
    getUser(id: string): User | Promise<User>;
}
