import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: true })
  public email?: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: false })
  public password!: string;

  @Column()
  public firstName!: string;

  @Column({ nullable: true })
  public middleName?: string;

  @Column()
  public lastName!: string;

  @Column({ default: true })
  public active!: boolean;

  @UpdateDateColumn()
  updatedDate!: Date;
}

export default User;
