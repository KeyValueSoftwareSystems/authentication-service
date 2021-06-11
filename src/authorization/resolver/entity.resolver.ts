import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Entity, NewEntityInput, UpdateEntityInput, UpdateEntityPermissionInput } from 'src/schema/graphql.schema';
import { EntityService } from '../service/entity.service';

@Resolver('Entity')
export class EntityResolver {
  constructor(private entityService: EntityService) {}

  @Query()
  getEntities(): Promise<Entity[]> {
    return this.entityService.getAllEntities();
  }

  @Query()
  getEntity(@Args('id', ParseUUIDPipe) id: string): Promise<Entity> {
    return this.entityService.getEntityById(id);
  }

  @Mutation()
  async createEntity(@Args('input') entityInput: NewEntityInput): Promise<Entity> {
    return this.entityService.createEntity(entityInput);
  }

  @Mutation()
  async updateEntity(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') entityInput: UpdateEntityInput,
  ): Promise<Entity> {
    return this.entityService.updateEntity(id, entityInput);
  }

  @Mutation()
  async updateEntityPermissions(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('input') entityInput: UpdateEntityPermissionInput,
  ): Promise<Entity[]> {
    return this.entityService.updateEntityPermissions(id, entityInput);
  }

  @Mutation()
  async deleteEntity(@Args('id', ParseUUIDPipe) id: string): Promise<Entity> {
    return this.entityService.deleteEntity(id);
  }
}
