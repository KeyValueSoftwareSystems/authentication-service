import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Group from './group.entity';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';

@Module({
  // providers: [GroupService],
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupResolver, GroupService],
})
export class GroupModule {}
