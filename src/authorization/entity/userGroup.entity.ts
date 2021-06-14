import { Entity, PrimaryColumn } from 'typeorm';
@Entity()
class UserGroup {
  @PrimaryColumn({ type: 'uuid' })
  public groupId!: string;

  @PrimaryColumn({ type: 'uuid' })
  public userId!: string;
}

export default UserGroup;
