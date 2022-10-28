import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewRoleInput,
  RoleInputFilter,
  RoleSearchInput,
  UpdateRoleInput,
  UpdateRolePermissionInput,
} from '../../schema/graphql.schema';
import { Connection, FindOperator, Repository } from 'typeorm';
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
import UserService from './user.service';

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
    private userService: UserService,
  ) {}

  async getAllRoles(input?: RoleInputFilter): Promise<Role[]> {
    let searchTerm: { [key: string]: FindOperator<string | undefined> }[] = [];
    if (input) {
      if (input.search) {
        searchTerm = this.generateSearchTermForRole(input.search);
      }
    }
    return await this.rolesRepository.find({
      where: searchTerm,
    });
  }

  generateSearchTermForRole(
    input: RoleSearchInput,
  ): {
    [key: string]: FindOperator<string | undefined>;
  }[] {
    const searchWhereCondition = [];
    const andConditions: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (input.and) {
      if (input.and.name) {
        andConditions[
          `name`
        ] = this.userService.generateWhereClauseForSearchTerm(input.and.name);
      }
    }
    if (Object.keys(andConditions).length) {
      searchWhereCondition.push(andConditions);
    }

    if (input.or) {
      if (input.or.name) {
        searchWhereCondition.push({
          name: this.userService.generateWhereClauseForSearchTerm(
            input.or.name,
          ),
        });
      }
    }
    return searchWhereCondition;
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
      throw new RoleDeleteNotAllowedException(id);
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
    const groupCount = await this.groupRoleRepository.count({
      where: { roleId: id },
    });
    return groupCount != 0;
  }
}
