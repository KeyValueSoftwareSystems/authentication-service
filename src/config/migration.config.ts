import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * Uses env params to configure TypeORM database library
 */
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string),
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  migrationsTableName: 'migrations',
  entities: [
    __dirname + '/../**/*.entity.ts',
    __dirname + '/../**/*.entity.js',
  ],
  migrations: ['dist/migrations/*.js'],
});

export default dataSource;
