import { Field } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Permission from '../permission/permission.entity';

@Entity()
class Group {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @Column({ default: true })
  public active!: boolean;

  @Field((type) => [Permission], { nullable: true })
  @ManyToMany((type) => Permission, permission => permission.id)
  public permissions?: Permission[];
  
}

export default Group;
