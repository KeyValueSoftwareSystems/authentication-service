import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: true})
  public email?: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({ nullable: true })
  public password?: string;

  @Column()
  public firstName!: string;

  @Column({ nullable: true })
  public middleName?: string;

  @Column()
  public lastName!: string;

  @Column({ default: true })
  public active!: boolean;

  @Column({ default: 'simple' })
  public origin!: string;

  @Column({ nullable: true })
  public externalUserId?: string;

  @Column({ nullable: true })
  public refreshToken?: string;

  @Column({ nullable: true })
  public twoFASecret?: string;

  @Column({ nullable: true, default: false })
  public twoFAEnabled?: boolean;
}

export default User;
