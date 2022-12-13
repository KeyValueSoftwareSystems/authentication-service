import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import {
  NewRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../../src/schema/graphql.schema';
import Permission from '../../../src/authorization/entity/permission.entity';
import { PermissionNotFoundException } from '../../../src/authorization/exception/permission.exception';
import { AuthenticationHelper } from '../../../src/authentication/authentication.helper';
import { RedisCacheService } from '../../../src/cache/redis-cache/redis-cache.service';
import { ConfigService } from '@nestjs/config';
import GroupRole from '../../../src/authorization/entity/groupRole.entity';
import Role from '../../../src/authorization/entity/role.entity';
import { RoleService } from '../../../src/authorization/service/role.service';
import RolePermission from '../../../src/authorization/entity/rolePermission.entity';
import RoleCacheService from '../../../src/authorization/service/rolecache.service';
import SearchService from '../../../src/authorization/service/search.service';
const roles: Role[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    name: 'Test1',
  },
];

const permissions: Permission[] = [
  {
    id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
    name: 'Customers',
  },
];

describe('test Role Service', () => {
  let roleService: RoleService;
  const rolesRepository = Substitute.for<Repository<Role>>();
  const permissionRepository = Substitute.for<Repository<Permission>>();
  const groupRoleRepository = Substitute.for<Repository<GroupRole>>();
  const rolePermissionRepository = Substitute.for<Repository<RolePermission>>();
  const roleCacheService = Substitute.for<RoleCacheService>();
  const redisCacheService = Substitute.for<RedisCacheService>();
  const searchService = Substitute.for<SearchService>();
  const connectionMock = Substitute.for<Connection>();
  const permissionQueryBuilder = Substitute.for<
    SelectQueryBuilder<Permission>
  >();
  const rolesQueryBuilder = Substitute.for<SelectQueryBuilder<Role>>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        RoleService,
        ConfigService,
        AuthenticationHelper,
        {
          provide: getRepositoryToken(Role),
          useValue: rolesRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepository,
        },
        {
          provide: getRepositoryToken(GroupRole),
          useValue: groupRoleRepository,
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: rolePermissionRepository,
        },
        { provide: 'RoleCacheService', useValue: roleCacheService },
        { provide: 'RedisCacheService', useValue: redisCacheService },
        { provide: 'SearchService', useValue: searchService },
        {
          provide: Connection,
          useValue: connectionMock,
        },
      ],
    }).compile();
    roleService = moduleRef.get<RoleService>(RoleService);
  });

  it('should get all roles', async () => {
    rolesRepository.createQueryBuilder().returns(rolesQueryBuilder);
    rolesQueryBuilder.getManyAndCount().returns(Promise.resolve([roles, 1]));
    const resp = await roleService.getAllRoles();
    expect(resp).toEqual([roles, 1]);
  });

  it('should get a role by id', async () => {
    rolesRepository
      .findOne('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .returns(Promise.resolve(roles[0]));
    const resp = await roleService.getRoleById(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(roles[0]);
  });

  it('should create a role', async () => {
    const input: NewRoleInput = {
      name: 'Test1',
    };
    rolesRepository.create(input).returns(roles[0]);

    rolesRepository.insert(roles[0]).returns(Arg.any());

    const resp = await roleService.createRole(input);
    expect(resp).toEqual(roles[0]);
  });

  it('should update a role', async () => {
    const input: UpdateRoleInput = {
      name: 'Test1',
    };

    rolesRepository
      .update('ae032b1b-cc3c-4e44-9197-276ca877a7f8', input)
      .returns(Promise.resolve(Arg.any()));

    const resp = await roleService.updateRole(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(roles[0]);
  });

  it('should add permissions to a role', async () => {
    const request = [
      {
        roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
        permissionId: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
      },
    ];
    const input: UpdateRolePermissionInput = {
      permissions: ['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'],
    };

    permissionRepository
      .findByIds(['2b33268a-7ff5-4cac-a87a-6bfc4430d34c'])
      .resolves(permissions);

    rolePermissionRepository.create(request).returns(request);

    permissionRepository
      .createQueryBuilder('permission')
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .leftJoinAndSelect(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .returns(permissionQueryBuilder);

    permissionQueryBuilder
      .where('rolePermission.roleId = :roleId', {
        roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      })
      .returns(permissionQueryBuilder);

    permissionQueryBuilder.getMany().resolves(permissions);

    connectionMock.transaction(Arg.any()).resolves(request);

    const resp = await roleService.updateRolePermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    expect(resp).toEqual(permissions);
  });

  it('should throw exception when adding invalid permissions to a role', async () => {
    const input: UpdateRolePermissionInput = {
      permissions: ['3e9e78c9-3fcd-4eed-b027-62f794680b03'],
    };

    permissionRepository
      .findByIds(['3e9e78c9-3fcd-4eed-b027-62f794680b03'])
      .resolves([]);

    const resp = roleService.updateRolePermissions(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
      input,
    );
    await expect(resp).rejects.toThrowError(
      new PermissionNotFoundException(
        ['3e9e78c9-3fcd-4eed-b027-62f794680b03'].toString(),
      ),
    );
  });

  it('should delete a role', async () => {
    rolesRepository
      .softDelete('ae032b1b-cc3c-4e44-9197-276ca877a7f8')
      .resolves(Arg.any());
    groupRoleRepository
      .count({
        where: { roleId: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8' },
      })
      .resolves(0);
    const resp = await roleService.deleteRole(
      'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    );
    expect(resp).toEqual(roles[0]);
  });

  it('should return all permissions of the role', async () => {
    const permissions: Permission[] = [
      {
        id: '2b33268a-7ff5-4cac-a87a-6bfc4430d34c',
        name: 'Customers',
      },
    ];
    permissionRepository
      .createQueryBuilder('permission')
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .leftJoinAndSelect(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .returns(permissionQueryBuilder);
    permissionQueryBuilder
      .where('rolePermission.roleId = :roleId', {
        roleId: 'fcd858c6-26c5-462b-8c53-4b544830dca8',
      })
      .returns(permissionQueryBuilder);
    const resp = await roleService.getRolePermissions(
      'fcd858c6-26c5-462b-8c53-4b544830dca8',
    );
    expect(resp).toEqual(permissions);
  });
});
