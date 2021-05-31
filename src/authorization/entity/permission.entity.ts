import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Permission {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @Column({ default: true })
  public active!: boolean;
}

export default Permission;
