import { Module } from '@nestjs/common';
import { UserauthService } from './service/userauth.service';
import { UserauthResolver } from './resolver/userauth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserService from 'src/user/user.service';
import User from 'src/user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationHelper } from './authentication.helper';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [
    UserauthResolver,
    UserauthService,
    UserService,
    AuthenticationHelper,
  ],
})
export class UserauthModule {}
