import { Injectable } from '@nestjs/common';
import { Equal, FindOperator, ILike, Like } from 'typeorm';
import { StringSearchCondition } from '../../schema/graphql.schema';

@Injectable()
export default class SearchService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public generateWhereClauseForStringSearch(
    input: StringSearchCondition,
  ): FindOperator<string | undefined> {
    if (input.contains) {
      return ILike(`%${input.contains}%`);
    } else if (input.equals) {
      return Equal(input.equals);
    } else {
      return Like(`%%`);
    }
  }
}
