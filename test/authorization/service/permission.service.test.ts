import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Substitute } from '@fluffy-spoon/substitute';
import {
  NewPermissionInput,
  UpdatePermissionInput,
} from '../../../src/schema/graphql.schema';
import { PermissionService } from '../../../src/authorization/service/permission.service';
import Permission from '../../../src/authorization/entity/permission.entity';
import UserPermission from '../../../src/authorization/entity/userPermission.entity';
import GroupPermission from '../../../src/authorization/entity/groupPermission.entity';
import { PermissionDeleteNotAllowedException } from '../../../src/authorization/exception/permission.exception';
import PermissionCacheService from '../../../src/authorization/service/permissioncache.service';
import { PermissionRepository } from 'src/authorization/repository/permission.repository';
import { UserPermissionRepository } from 'src/authorization/repository/userpermission.repository';
import { GroupPermissionRepository } from 'src/authorization/repository/grouppermission.repository';

const permissions: Permission[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    name: 'Test1',
    label: 'Test 1',
  },
];

describe('test Permission service', () => {
  let permissionService: PermissionService;
  const permissionRepository = Substitute.for<PermissionRepository>();
  const groupPermissionRepository = Substitute.for<GroupPermissionRepository>();
  const userPermissionRepository = Substitute.for<UserPermissionRepository>();
  const permissionCacheService = Substitute.for<PermissionCacheService>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(UserPermission),
          useValue: userPermissionRepository,
        },
        {
          provide: getRepositoryToken(GroupPermission),
          useValue: groupPermissionRepository,
        },
        {
          provide: PermissionCacheService,
          useValue: permissionCacheService,
        },
      ],
    }).compile();

    permissionService = moduleRef.get<PermissionService>(PermissionService);
  });

  it('should get all permissions', async () => {
    permissionRepository.getAllPermissions().resolves(permissions);

    const resp = await permissionService.getAllPermissions();

    expect(resp).toEqual(permissions);
  });

  it('should get a permission by id', async () => {
    permissionRepository
      .getPermissionById('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(permissions[0]);

    const resp = await permissionService.getPermissionById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );

    expect(resp).toEqual(permissions[0]);
  });

  it('should create a permission', async () => {
    const input: NewPermissionInput = {
      name: 'Test1',
    };

    permissionRepository.createPermission(input).resolves(permissions[0]);

    const resp = await permissionService.createPermission(input);

    expect(resp).toEqual(permissions[0]);
  });

  it('should update a permission', async () => {
    const input: UpdatePermissionInput = {
      name: 'Test1',
    };

    permissionRepository
      .updatePermission('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .resolves(permissions[0]);

    const resp = await permissionService.updatePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );

    expect(resp).toEqual(permissions[0]);
  });

  it('should delete a permission', async () => {
    userPermissionRepository
      .getUserPermissionCount('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(0);
    groupPermissionRepository
      .getGroupPermissionCount('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(0);
    permissionRepository
      .deletePermission('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(permissions[0]);

    const resp = await permissionService.deletePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );

    expect(resp).toEqual(permissions[0]);
  });

  it('should throw exception when deleting a permission in usage', async () => {
    userPermissionRepository
      .getUserPermissionCount('0d88ef27-dd26-4a01-bfef-4d703bcdb05d')
      .resolves(1);
    groupPermissionRepository
      .getGroupPermissionCount('0d88ef27-dd26-4a01-bfef-4d703bcdb05d')
      .resolves(0);
    permissionRepository
      .deletePermission('0d88ef27-dd26-4a01-bfef-4d703bcdb05d')
      .throws(new PermissionDeleteNotAllowedException());

    const resp = permissionService.deletePermission(
      '0d88ef27-dd26-4a01-bfef-4d703bcdb05d',
    );

    await expect(resp).rejects.toThrow(PermissionDeleteNotAllowedException);
  });
});
