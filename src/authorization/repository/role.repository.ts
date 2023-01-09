import { Injectable } from '@nestjs/common';
import { UpdateRoleInput } from 'src/schema/graphql.schema';
import { DataSource, In } from 'typeorm';
import Role from '../entity/role.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource);
  }

  async getRoleById(id: string) {
    return this.findOneBy({ id });
  }

  async updateRoleById(id: string, role: UpdateRoleInput): Promise<Boolean> {
    const updatedRole = await this.update(id, role);
    return updatedRole.affected !== 0;
  }

  async findByIds(ids: string[]) {
    return this.find({
      where: {
        id: In(ids),
      },
    });
  }
}
