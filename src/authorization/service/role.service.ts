import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewRoleInput,
  RoleInputFilter,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import { Connection, Repository } from 'typeorm';
import Role from '../entity/role.entity';
import RolePermission from '../entity/rolePermission.entity';
import Permission from '../entity/permission.entity';
import {
  RoleNotFoundException,
  RoleDeleteNotAllowedException,
} from '../exception/role.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import RoleCacheService from './rolecache.service';
import GroupRole from '../entity/groupRole.entity';
import SearchService from './search.service';
import { SearchEntity } from '../../constants/search.entity.enum';
import Group from '../entity/group.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private roleCacheService: RoleCacheService,
    private connection: Connection,
    private searchService: SearchService,
  ) {}

  async getAllRoles(input?: RoleInputFilter): Promise<[Role[], number]> {
    const SortFieldMapping = new Map([['name', 'Role.name']]);
    let queryBuilder = this.rolesRepository.createQueryBuilder();
    if (input?.search) {
      queryBuilder = this.searchService.generateSearchTermForEntity(
        queryBuilder,
        SearchEntity.ROLE,
        input.search,
      );
    }
    if (input?.sort) {
      const field = SortFieldMapping.get(input.sort.field);
      field && queryBuilder.orderBy(field, input.sort.direction);
    }
    if (input?.pagination) {
      queryBuilder
        .limit(input?.pagination?.limit ?? 10)
        .offset(input?.pagination?.offset ?? 0);
    }
    return await queryBuilder.getManyAndCount();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return role;
  }

  async createRole(role: NewRoleInput): Promise<Role> {
    const newRole = this.rolesRepository.create(role);
    await this.rolesRepository.insert(newRole);
    return newRole;
  }

  async updateRole(id: string, role: UpdateRoleInput): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne(id);
    if (!existingRole) {
      throw new RoleNotFoundException(id);
    }
    const roleToUpdate = this.rolesRepository.create(role);
    await this.rolesRepository.update(id, roleToUpdate);
    return {
      ...existingRole,
      ...roleToUpdate,
    };
  }

  async deleteRole(id: string): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne(id);
    if (!existingRole) {
      throw new RoleNotFoundException(id);
    }
    const usage = await this.checkRoleUsage(id);
    if (usage) {
      throw new RoleDeleteNotAllowedException();
    }
    await this.rolesRepository.softDelete(id);
    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return existingRole;
  }

  async updateRolePermissions(
    id: string,
    request: UpdateRolePermissionInput,
  ): Promise<Permission[]> {
    const updatedRole = await this.rolesRepository.findOne(id);
    if (!updatedRole) {
      throw new RoleNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.findByIds(
      request.permissions,
    );
    const existingPermissionsOfRole = await this.getRolePermissions(id);
    const validPermissionsInRequest: Set<string> = new Set(
      permissionsInRequest.map((p) => p.id),
    );

    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }

    const permissionsToBeRemovedFromRole: RolePermission[] = existingPermissionsOfRole
      .filter((p) => !validPermissionsInRequest.has(p.id))
      .map((p) => ({ permissionId: p.id, roleId: id }));

    const rolePermissions = this.rolePermissionRepository.create(
      request.permissions.map((permission) => ({
        roleId: id,
        permissionId: permission,
      })),
    );

    await this.connection.manager.transaction(async (entityManager) => {
      const rolePermissionsRepo = entityManager.getRepository(RolePermission);
      await rolePermissionsRepo.remove(permissionsToBeRemovedFromRole);
      await rolePermissionsRepo.save(rolePermissions);
    });

    const permissions = await this.getRolePermissions(id);

    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return permissions;
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect(
        RolePermission,
        'rolePermission',
        'permission.id = rolePermission.permissionId',
      )
      .where('rolePermission.roleId = :roleId', { roleId: id })
      .getMany();
    return permissions;
  }

  private async checkRoleUsage(id: string) {
    const groupCount = await this.groupRoleRepository
      .createQueryBuilder()
      .innerJoinAndSelect(Group, 'group', 'group.id = GroupRole.groupId')
      .where('GroupRole.roleId= :id', { id: id })
      .getCount();
    return groupCount != 0;
  }
}
