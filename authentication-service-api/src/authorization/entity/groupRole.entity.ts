import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class GroupRole extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public roleId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public groupId!: string;
}

export default GroupRole;
