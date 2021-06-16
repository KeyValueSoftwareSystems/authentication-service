import { Body, Controller, Get, Post } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import Group from 'src/authorization/entity/group.entity';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {

    constructor(private groupService: GroupService){}


    @Get()
    async getGroups(){
            this.groupService.getGroups
    }



    @Post()
    async createGroup(@Body() body: Group){
            this.groupService.createGroup(body)
    }


    @Get(':id')
    async getGroup(@Args('id') id: string){
        this.groupService.getGroup(id)
    }
}
