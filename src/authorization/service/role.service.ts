import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchEntity } from '../../constants/search.entity.enum';
import {
  NewRoleInput,
  RoleInputFilter,
  SortDirection,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import Permission from '../entity/permission.entity';
import Role from '../entity/role.entity';
import RolePermission from '../entity/rolePermission.entity';
import { PermissionNotFoundException } from '../exception/permission.exception';
import {
  RoleDeleteNotAllowedException,
  RoleNotFoundException,
} from '../exception/role.exception';
import { GroupRoleRepository } from '../repository/groupRole.repository';
import { PermissionRepository } from '../repository/permission.repository';
import { RoleRepository } from '../repository/role.repository';
import { RolePermissionRepository } from '../repository/rolePermission.repository';
import { RoleServiceInterface } from './role.service.interface';
import { RoleCacheServiceInterface } from './rolecache.service.interface';
import SearchService from './search.service';

@Injectable()
export class RoleService implements RoleServiceInterface {
  constructor(
    @Inject(RoleCacheServiceInterface)
    private roleCacheService: RoleCacheServiceInterface,
    private rolesRepository: RoleRepository,
    private groupRoleRepository: GroupRoleRepository,
    private rolePermissionRepository: RolePermissionRepository,
    private permissionRepository: PermissionRepository,
    private dataSource: DataSource,
    private searchService: SearchService,
  ) {}

  async getAllRoles(input?: RoleInputFilter): Promise<[Role[], number]> {
    const SortFieldMapping = new Map([
      ['name', 'role.name'],
      ['updatedAt', 'role.updated_at'],
    ]);
    let queryBuilder = this.rolesRepository.createQueryBuilder('role');
    if (input?.search) {
      queryBuilder = this.searchService.generateSearchTermForEntity(
        queryBuilder,
        SearchEntity.ROLE,
        input.search,
      );
    }

    if (input?.sort) {
      const field = SortFieldMapping.get(input.sort.field);
      field
        ? queryBuilder.orderBy(field, input.sort.direction)
        : queryBuilder.orderBy('role.updated_at', SortDirection.DESC);
    } else {
      queryBuilder.orderBy('role.updated_at', SortDirection.DESC);
    }

    if (input?.pagination) {
      queryBuilder
        .limit(input?.pagination?.limit ?? 10)
        .offset(input?.pagination?.offset ?? 0);
    }
    return queryBuilder.getManyAndCount();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.getRoleById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return role;
  }

  async createRole(role: NewRoleInput): Promise<Role> {
    return this.rolesRepository.save(role);
  }

  async updateRole(id: string, role: UpdateRoleInput): Promise<Role> {
    const updatedRole = await this.rolesRepository.updateRoleById(id, role);
    if (!updatedRole) {
      throw new RoleNotFoundException(id);
    }
    return this.getRoleById(id);
  }

  /**
   * Function to delete role and it's associated relations.
   * Role and it's relations are soft deleted and cache is invalidated.
   * The usage of the role in Groups are validated before deleting a role.
   * @param id
   * @returns
   */
  async deleteRole(id: string): Promise<Role> {
    const existingRole = await this.rolesRepository.getRoleById(id);
    if (!existingRole) {
      throw new RoleNotFoundException(id);
    }
    const usage = await this.checkRoleUsage(id);
    if (usage) {
      throw new RoleDeleteNotAllowedException();
    }

    await this.dataSource.manager.transaction(async (entityManager) => {
      const rolePermissionsRepo = entityManager.getRepository(RolePermission);
      const roleRepo = entityManager.getRepository(Role);
      await rolePermissionsRepo.softDelete({ roleId: id });
      await roleRepo.softDelete(id);
    });

    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return existingRole;
  }

  async updateRolePermissions(
    id: string,
    request: UpdateRolePermissionInput,
  ): Promise<Permission[]> {
    const updatedRole = await this.rolesRepository.getRoleById(id);
    if (!updatedRole) {
      throw new RoleNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.getPermissionsByIds(
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

    await this.dataSource.manager.transaction(async (entityManager) => {
      const rolePermissionsRepo = entityManager.getRepository(RolePermission);
      await rolePermissionsRepo.remove(permissionsToBeRemovedFromRole);
      await rolePermissionsRepo.save(rolePermissions);
    });

    const permissions = await this.getRolePermissions(id);

    await this.roleCacheService.invalidateRolePermissionsByRoleId(id);
    return permissions;
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    return this.permissionRepository.getPermissionsByRoleId(id);
  }

  private async checkRoleUsage(roleId: string) {
    const groupCount = await this.groupRoleRepository.getGroupCountForRoleId(
      roleId,
    );
    return groupCount !== 0;
  }
}
