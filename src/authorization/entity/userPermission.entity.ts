import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
class UserPermission {
  @PrimaryColumn({ type: 'uuid' })
  public permissionId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public userId!: string;
}

export default UserPermission;
