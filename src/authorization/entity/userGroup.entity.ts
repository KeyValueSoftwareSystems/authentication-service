import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';
@Entity()
class UserGroup extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public groupId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public userId!: string;
}

export default UserGroup;
