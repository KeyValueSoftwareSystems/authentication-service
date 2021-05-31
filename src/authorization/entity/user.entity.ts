import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
}

export default User;
