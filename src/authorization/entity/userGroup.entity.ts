import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import Group from './group.entity';
import User from './user.entity';

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
