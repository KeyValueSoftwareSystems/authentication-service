
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import UserService from '../../src/user/user.service';
import { Substitute } from "@fluffy-spoon/substitute";

const users: User[] = [
    {
      id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      email: 'user@test.com',
      firstName: 'Test1',
      lastName: 'Test2',
      active: true,
    },
  ]

describe('test UserService', () => {
    let userService: UserService;
    let userRepository = Substitute.for<Repository<User>>();

    beforeEach(async () => {

        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [],
            providers: [UserService, {
                provide: getRepositoryToken(User),
                useValue: userRepository
              },],
        }).compile();
        userService = moduleRef.get<UserService>(UserService);

    });

    it('should get all users', async () => {
        userRepository.find({ where: { active: true } }).returns(Promise.resolve(users));
        const resp = await userService.getAllUsers();
        expect(resp).toEqual(users);
    });
    
});
