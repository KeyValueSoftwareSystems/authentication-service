import { Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class EntityPermission extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public entityId!: string;
}

export default EntityPermission;
