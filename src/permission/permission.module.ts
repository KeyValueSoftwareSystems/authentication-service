import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Permission from './permission.entity';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';


@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionService, PermissionResolver],
})
export class PermissionModule {}
