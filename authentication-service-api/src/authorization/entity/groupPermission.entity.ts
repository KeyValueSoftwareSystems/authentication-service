import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class GroupPermission extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public groupId!: string;
}

export default GroupPermission;
