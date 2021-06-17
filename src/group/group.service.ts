import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupService {

    data = [{ id: '1', name: 'ceo' }];

    async getGroups(){
        return [];
    }

    async getGroup(id: string){

    }


    async createGroup(body: any){
        
    }
}
