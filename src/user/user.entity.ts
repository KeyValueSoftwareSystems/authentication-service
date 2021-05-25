import UserAuthDetails from 'src/authentication/entity/entity.userauth';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: true })
  public email?: string;

  @Column()
  public firstName!: string;

  @Column({ nullable: true })
  public middleName?: string;

  @Column()
  public lastName!: string;

  @Column({ default: true })
  public active!: boolean;

  @OneToOne(() => UserAuthDetails, (userAuthDetails) => userAuthDetails.user)
  userAuthDetails!: UserAuthDetails;
}

export default User;
