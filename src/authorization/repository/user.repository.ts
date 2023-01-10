import { Injectable } from '@nestjs/common';
import { UpdateUserInput } from 'src/schema/graphql.schema';
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

  async getUserByEmail(email: string) {
    return this.createQueryBuilder('user')
      .where('lower(user.email) = lower(:email)', { email })
      .getOne();
  }

  async getUserByPhone(phone: string) {
    return this.findOne({ where: { phone } });
  }

  async updateUserById(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<Boolean> {
    const result = await this.update(id, updateUserInput);
    return result.affected !== 0;
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

  async getUserCountForGroupId(groupId: string): Promise<number> {
    return this.createQueryBuilder('user')
      .innerJoinAndSelect(UserGroup, 'userGroup', 'userGroup.userId = user.id')
      .where('userGroup.groupId = :groupId', { groupId })
      .getCount();
  }
}
