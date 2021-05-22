import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import User from './user.entity';
import { NewUserInput, UpdateUserInput } from '../schema/graphql.schema';
import { UserNotFoundException } from './user.exception';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { active: true } });
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
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async updateUser(id: string, user: UpdateUserInput): Promise<User> {
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOne(id);
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserNotFoundException(id);
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
