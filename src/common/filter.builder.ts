import UserGroup from '../authorization/entity/userGroup.entity';
import {
  FilterConditions,
  FilterField,
  FilterInput,
} from '../schema/graphql.schema';
import { SelectQueryBuilder } from 'typeorm';

export class FilterBuilder<T> {
  constructor(private qb: SelectQueryBuilder<T>) {}

  ConditionMapping = new Map([
    [FilterConditions.EQUALS, '='],
    [FilterConditions.IN, 'IN'],
  ]);

  private applyUserGroupFilter(field: FilterField) {
    if (field.field == 'group') {
      this.qb.innerJoin(
        UserGroup,
        'userGroup',
        'userGroup.userId = User.id AND userGroup.groupId IN (:...groupIds)',
        { groupIds: field.value },
      );
    }
  }

  private applyUserFieldsFilter(field: FilterField) {
    const fieldMapping = new Map([['status', 'User.status']]);
    const userFields = ['status'];

    if (userFields.includes(field.field)) {
      this.qb.andWhere(
        `${fieldMapping.get(field.field)} ${this.ConditionMapping.get(
          field.condition,
        )} (:...${field.field})`,
        { [field.field]: field.value },
      );
    }
  }

  public build(filter: FilterInput) {
    filter.operands.map((o) => this.applyUserFieldsFilter(o));
    filter.operands.map((o) => this.applyUserGroupFilter(o));
  }
}
