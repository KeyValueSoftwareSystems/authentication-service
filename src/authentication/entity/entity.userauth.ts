import User from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_authorization_details')
class UserAuthDetails {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: true })
  public email?: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: false })
  public password!: string;

  @UpdateDateColumn()
  updatedDate!: Date;

  @OneToOne(() => User, (user) => user.userAuthDetails)
  @JoinColumn({ name: 'userId' })
  user!: User;
}

export default UserAuthDetails;
