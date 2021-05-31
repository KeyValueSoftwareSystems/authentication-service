import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class GroupPermission {
  @Column()
  @PrimaryColumn()
  public permissionId!: string;

  @PrimaryColumn()
  @Column()
  public groupId!: string;
}

export default GroupPermission;
