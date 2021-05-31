import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class UserPermission {
  @Column()
  @PrimaryColumn()
  public permissionId!: string;

  @PrimaryColumn()
  @Column()
  public userId!: string;
}

export default UserPermission;
