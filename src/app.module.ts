import { Module } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import formatGraphqlError from './exception/exception.formatter';
import { TerminusModule } from '@nestjs/terminus';
import { AppGraphQLModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    AppGraphQLModule,
    DatabaseModule,
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}