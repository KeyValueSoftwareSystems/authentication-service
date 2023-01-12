import {
  NewEntityInput,
  UpdateEntityInput,
  UpdateEntityPermissionInput,
} from 'src/schema/graphql.schema';
import EntityModel from '../entity/entity.entity';
import Permission from '../entity/permission.entity';

export interface EntityServiceInterface {
  getAllEntities(): Promise<EntityModel[]>;

  getEntityById(id: string): Promise<EntityModel>;

  createEntity(entity: NewEntityInput): Promise<EntityModel>;

  updateEntity(id: string, entity: UpdateEntityInput): Promise<EntityModel>;

  deleteEntity(id: string): Promise<EntityModel>;

  updateEntityPermissions(
    id: string,
    request: UpdateEntityPermissionInput,
  ): Promise<Permission[]>;

  getEntityPermissions(id: string): Promise<Permission[]>;
}

export const EntityServiceInterface = Symbol('EntityServiceInterface');
