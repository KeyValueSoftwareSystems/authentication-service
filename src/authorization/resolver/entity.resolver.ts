import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  Entity,
  NewEntityInput,
  UpdateEntityInput,
  UpdateEntityPermissionInput,
} from '../../schema/graphql.schema';
import { PermissionsType } from '../constants/authorization.constants';
import Permission from '../entity/permission.entity';
import { Permissions } from '../permissions.decorator';
import { EntityService } from '../service/entity.service';

@Resolver('Entity')
export class EntityResolver {
  constructor(private entityService: EntityService) {}

  @Query()
  @Permissions(PermissionsType.ViewEntities)
  getEntities(): Promise<Entity[]> {
    return this.entityService.getAllEntities();
  }

  @Query()
  @Permissions(PermissionsType.ViewEntities)
  getEntity(@Args('id', ParseUUIDPipe) id: string): Promise<Entity> {
    return this.entityService.getEntityById(id);
  }

  @Mutation()
  @Permissions(PermissionsType.CreateEntities)
  async createEntity(
    @Args('input') entityInput: NewEntityInput,
  ): Promise<Entity> {
    return this.entityService.createEntity(entityInput);
  }

  @Mutation()
  @Permissions(PermissionsType.EditEntities)
  async updateEntity(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') entityInput: UpdateEntityInput,
  ): Promise<Entity> {
    return this.entityService.updateEntity(id, entityInput);
  }

  @Mutation()
  @Permissions(PermissionsType.EditEntities)
  async updateEntityPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') entityInput: UpdateEntityPermissionInput,
  ): Promise<Entity[]> {
    return this.entityService.updateEntityPermissions(id, entityInput);
  }

  @Query()
  @Permissions(PermissionsType.ViewEntities)
  async getEntityPermissions(
    @Args('id', ParseUUIDPipe) id: string,
  ): Promise<Permission[]> {
    return this.entityService.getEntityPermissions(id);
  }

  @Mutation()
  @Permissions(PermissionsType.DeleteEntities)
  async deleteEntity(@Args('id', ParseUUIDPipe) id: string): Promise<Entity> {
    return this.entityService.deleteEntity(id);
  }

  @ResolveField('permissions')
  async getPermissionsOfEntity(entity: Entity) {
    if (entity.id) {
      return this.entityService.getEntityPermissions(entity.id);
    }
  }
}
