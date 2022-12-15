import {
  FilterConditions,
  FilterField,
  FilterInput,
} from '../schema/graphql.schema';
import { SelectQueryBuilder } from 'typeorm';

export class FilterBuilder<T> {
  constructor(
    private qb: SelectQueryBuilder<T>,
    private fieldMapping: Map<string, string>,
  ) {}

  MatchOperatorMapping = new Map([
    [FilterConditions.EQUALS, '='],
    [FilterConditions.IN, 'IN'],
  ]);

  private applyFieldsFilter(filter: FilterField) {
    if (Array.from(this.fieldMapping.keys()).includes(filter.field)) {
      const fieldToMatch = this.fieldMapping.get(filter.field);
      const operator = this.MatchOperatorMapping.get(filter.condition);
      const valueToMatch =
        filter.condition == FilterConditions.EQUALS
          ? filter.value[0]
          : filter.value;

      this.qb.andWhere(`${fieldToMatch} ${operator} (:...${filter.field})`, {
        [filter.field]: valueToMatch,
      });
    }
  }

  public build(filter: FilterInput) {
    filter.operands.map((o) => this.applyFieldsFilter(o));
  }
}
