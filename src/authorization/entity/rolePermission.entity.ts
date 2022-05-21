import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class RolePermission extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public roleId!: string;
}

export default RolePermission;
