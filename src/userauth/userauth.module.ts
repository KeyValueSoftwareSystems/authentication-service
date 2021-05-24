import { Module } from '@nestjs/common';
import { UserauthService } from './userauth.service';
import { UserauthResolver } from './userauth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserAuthDetails from './userauth.entity';
import UserService from 'src/user/user.service';
import User from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthDetails, User])],
  providers: [UserauthResolver, UserauthService, UserService],
})
export class UserauthModule {}
