import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NewEntityInput,
  UpdateEntityInput,
  UpdateEntityPermissionInput,
} from '../../schema/graphql.schema';
import { createQueryBuilder, Repository } from 'typeorm';
import EntityModel from '../entity/entity.entity';
import EntityPermission from '../entity/entityPermission.entity';
import Permission from '../entity/permission.entity';
import { EntityNotFoundException } from '../exception/entity.exception';
import { PermissionNotFoundException } from '../exception/permission.exception';

@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(EntityModel)
    private entityRepository: Repository<EntityModel>,
    @InjectRepository(EntityPermission)
    private entityPermissionRepository: Repository<EntityPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  getAllEntities(): Promise<EntityModel[]> {
    return this.entityRepository.find();
  }

  async getEntityById(id: string): Promise<EntityModel> {
    const entity = await this.entityRepository.findOne(id);
    if (entity) {
      return entity;
    }
    throw new EntityNotFoundException(id);
  }

  async createEntity(entity: NewEntityInput): Promise<EntityModel> {
    const newEntity = this.entityRepository.create(entity);
    await this.entityRepository.insert(newEntity);
    return newEntity;
  }

  async updateEntity(
    id: string,
    entity: UpdateEntityInput,
  ): Promise<EntityModel> {
    const existingEntity = await this.entityRepository.findOne(id);
    if (!existingEntity) {
      throw new EntityNotFoundException(id);
    }
    const entityToUpdate = this.entityRepository.create(entity);
    await this.entityRepository.update(id, entityToUpdate);

    return {
      ...existingEntity,
      ...entityToUpdate,
    };
  }

  async deleteEntity(id: string): Promise<EntityModel> {
    const existingEntity = await this.entityRepository.findOne(id);
    if (!existingEntity) {
      throw new EntityNotFoundException(id);
    }
    await this.entityRepository.softDelete(id);
    return existingEntity;
  }

  async updateEntityPermissions(
    id: string,
    request: UpdateEntityPermissionInput,
  ): Promise<Permission[]> {
    const updatedEntity = await this.entityRepository.findOne(id);
    if (!updatedEntity) {
      throw new EntityNotFoundException(id);
    }

    const permissionsInRequest = await this.permissionRepository.findByIds(
      request.permissions,
    );
    if (permissionsInRequest.length !== request.permissions.length) {
      const validPermissions = permissionsInRequest.map((p) => p.id);
      throw new PermissionNotFoundException(
        request.permissions
          .filter((p) => !validPermissions.includes(p))
          .toString(),
      );
    }
    const entityPermission = this.entityPermissionRepository.create(
      request.permissions.map((permission) => ({
        entityId: id,
        permissionId: permission,
      })),
    );
    const savedEntityPermissions = await this.entityPermissionRepository.save(
      entityPermission,
    );
    const permissions = await this.permissionRepository.findByIds(
      savedEntityPermissions.map((g) => g.permissionId),
    );
    return permissions;
  }

  async getEntityPermissions(id: string): Promise<Permission[]> {
    const permissions = await createQueryBuilder<Permission>('permission')
      .leftJoinAndSelect(
        EntityPermission,
        'entityPermission',
        'Permission.id = entityPermission.permissionId',
      )
      .where('entityPermission.entityId = :entityId', { entityId: id })
      .getMany();
    return permissions;
  }
}
