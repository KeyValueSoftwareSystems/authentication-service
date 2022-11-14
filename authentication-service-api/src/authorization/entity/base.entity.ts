import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

class BaseEntity {
  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

export default BaseEntity;
