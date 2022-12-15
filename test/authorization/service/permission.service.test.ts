import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
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

const permissions: Permission[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    name: 'Test1',
    label: 'Test 1',
  },
];

describe('test Permission service', () => {
  let permissionService: PermissionService;
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupPermissionRepository = Substitute.for<
    Repository<GroupPermission>
  >();
  const userPermissionRepository = Substitute.for<Repository<UserPermission>>();
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
    permissionRepository.find().returns(Promise.resolve(permissions));
    const resp = await permissionService.getAllPermissions();
    expect(resp).toEqual(permissions);
  });

  it('should get a permission by id', async () => {
    permissionRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(permissions[0]));
    const resp = await permissionService.getPermissionById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(permissions[0]);
  });

  it('should create a permission', async () => {
    const input: NewPermissionInput = {
      name: 'Test1',
    };
    permissionRepository.create(input).returns(permissions[0]);
    const insertRes = { raw: permissions, identifiers: [], generatedMaps: [] };

    permissionRepository
      .insert(permissions[0])
      .returns(Promise.resolve(insertRes));

    const resp = await permissionService.createPermission(input);
    expect(resp).toEqual(permissions[0]);
  });

  it('should update a permission', async () => {
    const input: UpdatePermissionInput = {
      name: 'Test1',
    };
    permissionRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    const resp = await permissionService.updatePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(permissions[0]);
  });

  it('should delete a permission', async () => {
    permissionRepository
      .softDelete('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(Arg.any());
    userPermissionRepository
      .count({
        where: { permissionId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8' },
      })
      .returns(Promise.resolve(0));
    groupPermissionRepository
      .count({
        where: { permissionId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8' },
      })
      .returns(Promise.resolve(0));
    permissionCacheService.invalidatePermissionsCache(Arg.any()).resolves();
    const resp = await permissionService.deletePermission(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(permissions[0]);
  });

  it('should throw exception when deleting a permission in usage', async () => {
    userPermissionRepository
      .count({
        where: { permissionId: '0d88ef27-dd26-4a01-bfef-4d703bcdb05d' },
      })
      .returns(Promise.resolve(1));
    groupPermissionRepository
      .count({
        where: { permissionId: '0d88ef27-dd26-4a01-bfef-4d703bcdb05d' },
      })
      .returns(Promise.resolve(0));

    const resp = permissionService.deletePermission(
      '0d88ef27-dd26-4a01-bfef-4d703bcdb05d',
    );
    await expect(resp).rejects.toThrowError(
      new PermissionDeleteNotAllowedException(),
    );
  });
});
