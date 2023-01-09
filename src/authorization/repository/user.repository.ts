import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import User from '../entity/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource);
  }

  async getUserById(id: string) {
    return this.findOneBy({ id });
  }

  async findByIds(ids: string[]) {
    return this.find({
      where: {
        id: In(ids),
      },
    });
  }
}
