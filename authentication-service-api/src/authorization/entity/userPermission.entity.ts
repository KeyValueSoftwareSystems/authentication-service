import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class UserPermission extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public userId!: string;
}

export default UserPermission;
