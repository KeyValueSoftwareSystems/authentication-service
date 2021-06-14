import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
class GroupPermission {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public groupId!: string;
}

export default GroupPermission;
