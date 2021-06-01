import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import {
  NewGroupInput,
  UpdateGroupInput,
  UpdateGroupPermissionInput,
} from 'src/schema/graphql.schema';
import Group from '../../../src/authorization/entity/group.entity';
import { GroupService } from '../../../src/authorization/service/group.service';
import Permission from '../../../src/authorization/entity/permission.entity';
import GroupPermission from '../../../src/authorization/entity/groupPermission.entity';
import { PermissionNotFoundException } from '../../../src/authorization/exception/permission.exception';

const groups: Group[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    name: 'Test1',
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

describe('test Group Service', () => {
  let groupService: GroupService;
  const groupRepository = Substitute.for<Repository<Group>>();
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupPermissionRepository = Substitute.for<
    Repository<GroupPermission>
  >();
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(GroupPermission),
          useValue: groupPermissionRepository,
        },
      ],
    }).compile();
    groupService = moduleRef.get<GroupService>(GroupService);
  });

  it('should get all groups', async () => {
    groupRepository
      .find({ where: { active: true } })
      .returns(Promise.resolve(groups));
    const resp = await groupService.getAllGroups();
    expect(resp).toEqual(groups);
  });

  it('should get a group by id', async () => {
    groupRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8', {
        where: { active: true },
      })
      .returns(Promise.resolve(groups[0]));
    const resp = await groupService.getGroupById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should create a user', async () => {
    const input: NewGroupInput = {
      name: 'Test1',
    };
    groupRepository.create(input).returns(groups[0]);

    groupRepository.save(groups[0]).returns(Promise.resolve(groups[0]));

    const resp = await groupService.createGroup(input);
    expect(resp).toEqual(groups[0]);
  });

  it('should update a group', async () => {
    const input: UpdateGroupInput = {
      name: 'Test1',
    };
    groupRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    groupRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(groups[0]));

    const resp = await groupService.updateGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(groups[0]);
  });

  it('should add permissions to a group', async () => {
    const request = [
      {
        groupId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
      },
    ];
    const input: UpdateGroupPermissionInput = {
      permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
    };

    permissionRepository
      .findByIds(['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'])
      .resolves(permissions);

    groupPermissionRepository.create(request).returns(request);

    groupPermissionRepository.save(request).resolves(request);

    const resp = await groupService.updateGroupPermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(permissions);
  });

  it('should throw exception when adding invalid permissions to a group', async () => {
    const input: UpdateGroupPermissionInput = {
      permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
    };

    permissionRepository
      .findByIds(['3e9e78c9-3fcd-4eed-b027-62f794680b03'])
      .resolves([]);

    const resp = groupService.updateGroupPermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    await expect(resp).rejects.toThrowError(
      new PermissionNotFoundException(
        ['3e9e78c9-3fcd-4eed-b027-62f794680b03'].toString(),
      ),
    );
  });

  it('should delete a group', async () => {
    groupRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', { active: false })
      .resolves(Arg.any());

    const resp = await groupService.deleteGroup(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(groups[0]);
  });
});