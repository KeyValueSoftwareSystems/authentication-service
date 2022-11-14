import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class EntityModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;
}

export default EntityModel;
