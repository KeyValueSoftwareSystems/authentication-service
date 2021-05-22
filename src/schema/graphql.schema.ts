/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
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

export interface User {
    id: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    active: boolean;
}

export interface IQuery {
    getUsers(): User[] | Promise<User[]>;
    getUser(id: string): User | Promise<User>;
}

export interface IMutation {
    createUser(input?: NewUserInput): User | Promise<User>;
    updateUser(id: string, input?: UpdateUserInput): User | Promise<User>;
    deleteUser(id: string): User | Promise<User>;
}
