import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
@Index('permission_name_unique_idx', { synchronize: false })
class Permission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;

  @Column({ nullable: true })
  public label?: string;
}

export default Permission;
