import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  constructor(entity: EntityTarget<T>, dataSource: DataSource) {
    super(entity, dataSource.createEntityManager());
  }
}
