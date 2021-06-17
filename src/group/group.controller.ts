import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import Group from 'src/authorization/entity/group.entity';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {

    constructor(private groupService: GroupService){}

// GET /groups/profile
    @Get('profile')
    async getGroups(){
            return this.groupService.getGroups
    }



    @Post()
    async createGroup(@Body() body: Group, @Req() req: Request){
        return this.groupService.createGroup(body)
    }


    @Get(':id')
    async getGroup(@Param('id') id: string){
        return  this.groupService.getGroup(id)
    }
}
