import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class EntityPermission {
  @Column()
  @PrimaryColumn()
  public permissionId!: string;

  @PrimaryColumn()
  @Column()
  public entityId!: string;
}

export default EntityPermission;
