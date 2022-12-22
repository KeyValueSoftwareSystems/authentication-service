import { Status } from '../../schema/graphql.schema';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
@Index('user_phone_unique_idx', ['phone'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('user_email_unique_idx', { synchronize: false })
class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: true })
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

  @Column({ type: 'enum', enum: Status, default: Status.INACTIVE })
  public status!: Status;

  @Column({ nullable: true })
  public inviteToken?: string;
}

export default User;
