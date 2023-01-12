import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  NewEntityInput,
  UpdateEntityInput,
  UpdateEntityPermissionInput,
} from '../../schema/graphql.schema';
import EntityModel from '../entity/entity.entity';
import EntityPermission from '../entity/entityPermission.entity';
import Permission from '../entity/permission.entity';
import { EntityNotFoundException } from '../exception/entity.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';
import { EntityModelRepository } from '../repository/entity.repository';
import { EntityPermissionRepository } from '../repository/entityPermission.repository';
import { PermissionRepository } from '../repository/permission.repository';

@Injectable()
export class EntityService {
  constructor(
    private entityRepository: EntityModelRepository,
    private entityPermissionRepository: EntityPermissionRepository,
    private permissionRepository: PermissionRepository,
    private dataSource: DataSource,
  ) {}

  async getAllEntities(): Promise<EntityModel[]> {
    return this.entityRepository.getAllEntities();
  }

  async getEntityById(id: string): Promise<EntityModel> {
    const entity = await this.entityRepository.getEntityById(id);
    if (entity) {
      return entity;
    }
    throw new EntityNotFoundException(id);
  }

  async createEntity(entity: NewEntityInput): Promise<EntityModel> {
    return this.entityRepository.save(entity);
  }

  async updateEntity(
    id: string,
    entity: UpdateEntityInput,
  ): Promise<EntityModel> {
    const updateEntity = await this.entityRepository.updateEntityById(
      id,
      entity,
    );
    if (!updateEntity) {
      throw new EntityNotFoundException(id);
    }

    return this.getEntityById(id);
  }

  async deleteEntity(id: string): Promise<EntityModel> {
    const existingEntity = await this.entityRepository.getEntityById(id);
    if (!existingEntity) {
      throw new EntityNotFoundException(id);
    }

    await this.dataSource.manager.transaction(async (entityManager) => {
      const entityRepo = entityManager.getRepository(EntityModel);
      const entityPermissionRepo = entityManager.getRepository(
        EntityPermission,
      );
      await entityPermissionRepo.softDelete({ entityId: id });
      await entityRepo.softDelete(id);
    });

    await this.entityRepository.softDelete(id);
    return existingEntity;
  }

  async updateEntityPermissions(
    id: string,
    request: UpdateEntityPermissionInput,
  ): Promise<Permission[]> {
    const updatedEntity = await this.entityRepository.getEntityById(id);
    if (!updatedEntity) {
      throw new EntityNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.getPermissionsByIds(
      request.permissions,
    );
    const existingPermissionsOfEntity = await this.getEntityPermissions(id);
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

    const permissionsToBeRemovedFromEntity: EntityPermission[] = existingPermissionsOfEntity
      .filter((p) => !validPermissionsInRequest.has(p.id))
      .map((p) => ({ permissionId: p.id, entityId: id }));

    const entityPermission = this.entityPermissionRepository.create(
      request.permissions.map((permission) => ({
        entityId: id,
        permissionId: permission,
      })),
    );

    await this.dataSource.manager.transaction(async (entityManager) => {
      const entityPermissionsRepo = entityManager.getRepository(
        EntityPermission,
      );
      await entityPermissionsRepo.remove(permissionsToBeRemovedFromEntity);
      await entityPermissionsRepo.save(entityPermission);
    });
    const permissions = await this.getEntityPermissions(id);
    return permissions;
  }

  async getEntityPermissions(entityId: string): Promise<Permission[]> {
    return this.permissionRepository.getPermissionsByEntityId(entityId);
  }
}
