import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import formatGraphqlError from '../exception/exception.formatter';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot({
      // playground: true,
      useGlobalPrefix: true,
      typePaths: [__dirname + '/../../../../../../apps/kv-ums-api/src/**/*.graphql'],
      definitions: {
        path: join(process.cwd(), '/../../../../../apps/kv-ums-api/src/schema/graphql.schema.ts'),
      },
      formatError: formatGraphqlError,
      context: ({ req }) => ({ headers: req.headers }),
    }),
  ],
})
export class AppGraphQLModule {}
