import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import User from './user.entity';
import { NewUserInput, UpdateUserInput, UpdateUserPermissionInput } from '../schema/graphql.schema';
import { UserNotFoundException } from './user.exception';
import Group from '../group/group.entity';
import Permission from '../permission/permission.entity';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { active: true }, relations: ["groups"] });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id, {
      where: { active: true },
      relations: ["groups"],
    });
    if (user) {
      return user;
    }
    throw new UserNotFoundException(id);
  }

  async createUser(user: NewUserInput): Promise<User> {
    const newUser = await this.usersRepository.create({...user, groups: user.groups ? user.groups.map(group => ({id: group})) : []});
    const createdUser = await this.usersRepository.save(newUser);
    const savedUser = await this.usersRepository.findOneOrFail(createdUser.id, {
      where: { active: true },
      relations: ["groups"],
    });
    return savedUser;
  }

  async updateUser(id: string, user: UpdateUserInput): Promise<User> {
    const newUser = await this.usersRepository.create({...user, groups: user.groups ? user.groups.map(group => ({id: group})) : []});
    await this.usersRepository.update(id, newUser);
    const updatedUser = await this.usersRepository.findOne(id, {
      where: { active: true },
      relations: ["groups"],
    });
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserNotFoundException(id);
  }


  async updateUserPermissions(id: string, request: UpdateUserPermissionInput): Promise<Permission[]> {
    const existingUser = await this.usersRepository.findOne(id, {
      where: { active: true },
      relations: ["groups", "permissions"],
    });
    if(!existingUser) {
      throw new UserNotFoundException(id);
    }
    const userToBeUpdated = await this.usersRepository.create({...existingUser, permissions: request.permissions.map(permission => ({id: permission}))});
    const newUser = await this.usersRepository.save(userToBeUpdated);
    const updatedUser = await this.usersRepository.findOneOrFail(id, {
      where: { active: true },
      relations: ["groups", "permissions"],
    });
    return updatedUser.permissions ? updatedUser.permissions: [];
  }

  async deleteUser(id: string): Promise<User> {
    await this.usersRepository.update(id, { active: false });
    const deletedUser = await this.usersRepository.findOne(id);
    if (deletedUser) {
      return deletedUser;
    }
    throw new UserNotFoundException(id);
  }
}
