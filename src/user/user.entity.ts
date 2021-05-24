import { Field } from '@nestjs/graphql';
import { type } from 'node:os';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Group from '../group/group.entity';
import Permission from '../permission/permission.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public email!: string;

  @Column()
  public firstName!: string;

  @Column({ nullable: true })
  public middleName?: string;

  @Column()
  public lastName!: string;

  @Column({ default: true })
  public active!: boolean;

  @ManyToMany((type) => Group)
  @JoinTable()
  public groups?: Group[];

  @ManyToMany((type) => Permission, (permission) => permission.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'user_permissions_permission' })
  permissions?: Permission[];
}

export default User;
