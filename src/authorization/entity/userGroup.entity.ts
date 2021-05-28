import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity()
class UserGroup {
  @Column()
  @PrimaryColumn()
  public groupId!: string;

  @PrimaryColumn()
  @Column()
  public userId!: string;
}

export default UserGroup;
