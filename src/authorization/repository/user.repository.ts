import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import User from '../entity/user.entity';
import UserGroup from '../entity/userGroup.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource);
  }

  async getUserById(id: string) {
    return this.findOneBy({ id });
  }

  async getUsersByIds(ids: string[]) {
    return this.find({
      where: {
        id: In(ids),
      },
    });
  }

  async getUsersByGroupId(groupId: string): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId = user.id')
      .where('userGroup.groupId = :groupId', { groupId })
      .getMany();
  }
}
