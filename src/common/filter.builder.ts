import UserGroup from 'src/authorization/entity/userGroup.entity';
import {
  FilterConditions,
  FilterField,
  FilterInput,
} from 'src/schema/graphql.schema';
import { FindOperator, In, SelectQueryBuilder } from 'typeorm';

export class FilterBuilder<T> {
  constructor(private qb: SelectQueryBuilder<T>) {}

  ConditionMapping = new Map([
    [FilterConditions.EQUALS, '='],
    [FilterConditions.IN, 'IN'],
  ]);

  private applyField(
    field: FilterField,
  ): { [key: string]: FindOperator<string | undefined> } {
    const andCondition: {
      [key: string]: FindOperator<string | undefined>;
    } = {};
    if (field.condition == FilterConditions.EQUALS) {
      andCondition[field.field] = In(field.value);
      return andCondition;
    }
    return andCondition;
  }

  private applyCond(input: FilterInput) {
    return input.operands.map((x) => this.applyField(x));
  }

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
        fieldMapping.get(field.field) +
          ' ' +
          this.ConditionMapping.get(field.condition) +
          ' :' +
          field.field,
        { [field.field]: field.value[0] },
      );
    }
  }

  public build(
    filter: FilterInput,
  ): { [key: string]: FindOperator<string | undefined> }[] {
    filter.operands.map((o) => this.applyUserFieldsFilter(o));
    filter.operands.map((o) => this.applyUserGroupFilter(o));

    return this.applyCond(filter);
  }
}
