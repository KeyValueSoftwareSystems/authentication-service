import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Group from './entity/group.entity';
import GroupPermission from './entity/groupPermission.entity';
import Permission from './entity/permission.entity';
import User from './entity/user.entity';
import UserGroup from './entity/userGroup.entity';
import UserPermission from './entity/userPermission.entity';
import { GroupResolver } from './resolver/group.resolver';
import { PermissionResolver } from './resolver/permission.resolver';
import { UserResolver } from './resolver/user.resolver';
import { GroupService } from './service/group.service';
import { PermissionService } from './service/permission.service';
import UserService from './service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forFeature([Permission]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserGroup]),
    TypeOrmModule.forFeature([UserPermission]),
    TypeOrmModule.forFeature([GroupPermission]),
  ],
  providers: [
    GroupResolver,
    GroupService,
    PermissionService,
    PermissionResolver,
    UserService,
    UserResolver,
  ],
})
export class AuthorizationModule {}
