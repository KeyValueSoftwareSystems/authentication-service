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

/*

Authorization
  user(user_group, user_permission), group(group_permission), permissions -> 

Authentication
  sign up, login
  social login -> google, apple, 

*/
