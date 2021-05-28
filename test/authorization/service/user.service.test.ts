import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../../../src/authorization/entity/user.entity';
import { Repository } from 'typeorm';
import UserService from '../../../src/authorization/service/user.service';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { NewUserInput, UpdateUserInput, UpdateUserPermissionInput } from 'src/schema/graphql.schema';
import { Args } from '@nestjs/graphql';
import Group from '../../../src/authorization/entity/group.entity';
import Permission from '../../../src/authorization/entity/permission.entity';
import UserPermission from '../../../src/authorization/entity/userPermission.entity';
import UserGroup from '../../../src/authorization/entity/userGroup.entity';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
  },
];

const permissions: Permission[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
    active: true,
  },
];

const groups: Group[] = [
  {
    id: '39d338b9-02bd-4971-a24e-b39a3f475580',
    name: 'Customers',
    active: true,
  },
];
describe('test UserService', () => {
  let userService: UserService;
  const userRepository = Substitute.for<Repository<User>>();
  const groupRepository = Substitute.for<Repository<Group>>();
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const userPermissionRepository = Substitute.for<Repository<UserPermission>>();
  const userGroupRepository = Substitute.for<Repository<UserGroup>>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepository,
        },
        {
          provide: getRepositoryToken(UserGroup),
          useValue: userGroupRepository,
        },
        {
          provide: getRepositoryToken(UserPermission),
          useValue: userPermissionRepository,
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
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8', {
        where: { active: true },
      })
      .returns(Promise.resolve(users[0]));
    const resp = await userService.getUserById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(users[0]);
  });

  it('should create a user', async () => {
    const input = {
      email: 'user@test.com',
      firstName: 'Test1',
      lastName: 'Test2',
    };
    userRepository.create(input).returns(users[0]);

    userRepository.save(users[0]).resolves(users[0]);

    const resp = await userService.createUser(input);
    console.log(resp);
    expect(resp).toEqual(users[0]);
  });

  it('should update a user', async () => {
    const input = {
      firstName: 'Test1',
      lastName: 'Test2',
    };
    userRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    userRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(users[0]));

    const resp = await userService.updateUser(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(users[0]);
  });

  it('should delete a user', async () => {
    userRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', { active: false })
      .resolves(Arg.any());

    const resp = await userService.deleteUser(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(users[0]);
  });

  it('should update user permissions', async () => {
    const request = [{userId: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", permissionId: "2b33268a-7ff5-4cac-a87a-6bfc4430d34c"}]
    userPermissionRepository.create(request).returns(request);
    userPermissionRepository.save(request).resolves(request);
    permissionRepository.findByIds(["2b33268a-7ff5-4cac-a87a-6bfc4430d34c"]).resolves(permissions);

    const resp = await userService.updateUserPermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      {permissions: ["2b33268a-7ff5-4cac-a87a-6bfc4430d34c"]}
    );
    expect(resp).toEqual(permissions);
  });

  it('should update user groups', async () => {
    const request = [{userId: "ae032b1b-cc3c-4e44-9197-276ca877a7f8", groupId: "39d338b9-02bd-4971-a24e-b39a3f475580"}]
    userGroupRepository.create(request).returns(request);
    userGroupRepository.save(request).resolves(request);
    groupRepository.findByIds(["39d338b9-02bd-4971-a24e-b39a3f475580"]).resolves(groups);

    const resp = await userService.updateUserGroups(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      {groups: ["39d338b9-02bd-4971-a24e-b39a3f475580"]}
    );
    expect(resp).toEqual(groups);
  });
});
