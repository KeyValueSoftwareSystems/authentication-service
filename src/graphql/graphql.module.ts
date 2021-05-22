import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import formatGraphqlError from '../exception/exception.formatter';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot({
      playground: true,
      useGlobalPrefix: true,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/schema/graphql.schema.ts'),
      },
      formatError: formatGraphqlError,
    }),
  ],
})
export class AppGraphQLModule {}
