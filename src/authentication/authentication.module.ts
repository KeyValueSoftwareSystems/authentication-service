import { Module } from '@nestjs/common';
import { UserauthService } from './service/service.userauth';
import { UserauthResolver } from './resolver/resolver.userauth';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserAuthDetails from './entity/entity.userauth';
import UserService from 'src/user/user.service';
import User from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthDetails, User])],
  providers: [UserauthResolver, UserauthService, UserService],
})
export class UserauthModule {}
