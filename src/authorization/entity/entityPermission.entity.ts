import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
class EntityPermission {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public entityId!: string;
}

export default EntityPermission;
