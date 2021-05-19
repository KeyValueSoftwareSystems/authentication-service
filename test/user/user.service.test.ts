import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import UserService from '../../src/user/user.service';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { NewUserInput } from 'src/schema/graphql.schema';
import { Args } from '@nestjs/graphql';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
  },
];

describe('test UserService', () => {
  let userService: UserService;
  const userRepository = Substitute.for<Repository<User>>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();
    userService = moduleRef.get<UserService>(UserService);
  });

  it('should get all users', async () => {
    userRepository
      .find({ where: { active: true } })
      .returns(Promise.resolve(users));
    const resp = await userService.getAllUsers();
    expect(resp).toEqual(users);
  });

  it('should get a user by id', async () => {
    userRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8', { where: { active: true } })
      .returns(Promise.resolve(users[0]));
    const resp = await userService.getUserById('ae032b1b-cc3c-4e44-9197-276ca877a7f8');
    expect(resp).toEqual(users[0]);
  });

  it('should create a user', async () => {
    const input: NewUserInput = {
        email: 'user@test.com',
        firstName: 'Test1',
        lastName: 'Test2',
      };
    userRepository
      .create(input)
      .returns(users[0]);

    userRepository
      .save(users[0])
      .returns(Promise.resolve(users[0]));
    

    const resp = await userService.createUser(input);
    expect(resp).toEqual(users[0]);
  });

  it('should update a user', async () => {
    const input: NewUserInput = {
        email: 'user@test.com',
        firstName: 'Test1',
        lastName: 'Test2',
      };
    userRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    userRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(users[0]));
    

    const resp = await userService.updateUser('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input);
    expect(resp).toEqual(users[0]);
  });

  it('should delete a user', async () => {
    userRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', {active: false})
      .resolves(Arg.any()); 

    const resp = await userService.deleteUser('ae032b1b-cc3c-4e44-9197-276ca877a7f8');
    expect(resp).toEqual(users[0]);
  })
});
