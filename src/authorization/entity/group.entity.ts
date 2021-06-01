import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
class Group {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public name!: string;

  @Column({ default: true })
  public active!: boolean;
}

export default Group;
