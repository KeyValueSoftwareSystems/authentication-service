import { Module } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AppGraphQLModule } from './graphql/graphql.module';
import { UserauthModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { GroupModule } from './group/group.module';

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
        JWT_SECRET: Joi.string().required().min(10),
      }),
    }),
    AppGraphQLModule,
    DatabaseModule,
    UserauthModule,
    AuthorizationModule,
    GroupModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
