import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;

  @Column({ default: true })
  public active!: boolean;
}

export default Group;
